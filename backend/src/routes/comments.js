const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../models/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 페이지별 코멘트 조회
router.get('/:docId', optionalAuth, async (req, res) => {
  try {
    const { docId } = req.params;
    const { page } = req.query;

    let whereClause = 'WHERE doc_id = ?';
    let params = [docId];

    if (page !== undefined) {
      whereClause += ' AND page = ?';
      params.push(parseInt(page));
    }

    const comments = await dbHelpers.all(`
      SELECT 
        c.*,
        COALESCE(u.name, c.author_name, '익명') as author_display_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      ${whereClause}
      ORDER BY c.created_at ASC
    `, params);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('코멘트 조회 오류:', error);
    res.status(500).json({ success: false, error: '코멘트 조회 중 오류가 발생했습니다.' });
  }
});

// 코멘트 작성
router.post('/:docId', optionalAuth, async (req, res) => {
  try {
    const { docId } = req.params;
    const { page, body, authorName } = req.body;

    if (typeof page !== 'number') {
      return res.status(400).json({ success: false, error: '페이지 번호가 필요합니다.' });
    }

    if (!body || body.trim() === '') {
      return res.status(400).json({ success: false, error: '코멘트 내용이 필요합니다.' });
    }

    // 문서 존재 확인
    const document = await dbHelpers.get('SELECT * FROM documents WHERE id = ?', [docId]);
    if (!document) {
      return res.status(404).json({ success: false, error: '문서를 찾을 수 없습니다.' });
    }

    const commentId = uuidv4();
    const displayName = req.user?.name || authorName || '익명';

    await dbHelpers.run(`
      INSERT INTO comments (id, doc_id, author_id, author_name, page, body)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      commentId,
      docId,
      req.user?.id || null,
      displayName,
      page,
      body.trim()
    ]);

    const newComment = await dbHelpers.get(`
      SELECT 
        c.*,
        COALESCE(u.name, c.author_name, '익명') as author_display_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('코멘트 작성 오류:', error);
    res.status(500).json({ success: false, error: '코멘트 작성 중 오류가 발생했습니다.' });
  }
});

// 코멘트 수정
router.put('/:docId/:commentId', optionalAuth, async (req, res) => {
  try {
    const { docId, commentId } = req.params;
    const { body } = req.body;

    if (!body || body.trim() === '') {
      return res.status(400).json({ success: false, error: '코멘트 내용이 필요합니다.' });
    }

    // 코멘트 존재 및 권한 확인
    const comment = await dbHelpers.get(
      'SELECT * FROM comments WHERE id = ? AND doc_id = ?',
      [commentId, docId]
    );

    if (!comment) {
      return res.status(404).json({ success: false, error: '코멘트를 찾을 수 없습니다.' });
    }

    // 작성자 확인 (로그인한 사용자만 자신의 코멘트 수정 가능)
    if (!req.user || comment.author_id !== req.user.id) {
      return res.status(403).json({ success: false, error: '코멘트 수정 권한이 없습니다.' });
    }

    await dbHelpers.run(
      'UPDATE comments SET body = ? WHERE id = ?',
      [body.trim(), commentId]
    );

    const updatedComment = await dbHelpers.get(`
      SELECT 
        c.*,
        COALESCE(u.name, c.author_name, '익명') as author_display_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    res.json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    console.error('코멘트 수정 오류:', error);
    res.status(500).json({ success: false, error: '코멘트 수정 중 오류가 발생했습니다.' });
  }
});

// 코멘트 삭제
router.delete('/:docId/:commentId', optionalAuth, async (req, res) => {
  try {
    const { docId, commentId } = req.params;

    // 코멘트 존재 및 권한 확인
    const comment = await dbHelpers.get(
      'SELECT * FROM comments WHERE id = ? AND doc_id = ?',
      [commentId, docId]
    );

    if (!comment) {
      return res.status(404).json({ success: false, error: '코멘트를 찾을 수 없습니다.' });
    }

    // 작성자 또는 문서 소유자만 삭제 가능
    const document = await dbHelpers.get('SELECT * FROM documents WHERE id = ?', [docId]);
    const canDelete = req.user && (
      comment.author_id === req.user.id || 
      document.owner_id === req.user.id
    );

    if (!canDelete) {
      return res.status(403).json({ success: false, error: '코멘트 삭제 권한이 없습니다.' });
    }

    await dbHelpers.run('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ success: true });
  } catch (error) {
    console.error('코멘트 삭제 오류:', error);
    res.status(500).json({ success: false, error: '코멘트 삭제 중 오류가 발생했습니다.' });
  }
});

// 문서별 코멘트 통계
router.get('/:docId/stats', optionalAuth, async (req, res) => {
  try {
    const { docId } = req.params;

    const stats = await dbHelpers.all(`
      SELECT 
        page,
        COUNT(*) as comment_count,
        COUNT(DISTINCT author_id) as unique_authors
      FROM comments 
      WHERE doc_id = ?
      GROUP BY page
      ORDER BY page ASC
    `, [docId]);

    const totalStats = await dbHelpers.get(`
      SELECT 
        COUNT(*) as total_comments,
        COUNT(DISTINCT author_id) as total_authors,
        MIN(created_at) as first_comment_at,
        MAX(created_at) as last_comment_at
      FROM comments 
      WHERE doc_id = ?
    `, [docId]);

    res.json({
      success: true,
      data: {
        byPage: stats,
        total: totalStats
      }
    });
  } catch (error) {
    console.error('코멘트 통계 조회 오류:', error);
    res.status(500).json({ success: false, error: '코멘트 통계 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;