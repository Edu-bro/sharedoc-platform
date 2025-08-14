const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 공유 링크 생성/업데이트
router.post('/:docId', authenticateToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const { permission, password, expireAt } = req.body;

    // 문서 소유자 확인
    const document = await dbHelpers.get(
      'SELECT * FROM documents WHERE id = ? AND owner_id = ?',
      [docId, req.user.id]
    );

    if (!document) {
      return res.status(404).json({ success: false, error: '문서를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 기존 공유 링크 비활성화
    await dbHelpers.run(
      'UPDATE shares SET is_active = 0 WHERE doc_id = ?',
      [docId]
    );

    // 새 공유 링크 생성
    const linkId = uuidv4();
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    await dbHelpers.run(`
      INSERT INTO shares (doc_id, link_id, permission, password_hash, expire_at, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [docId, linkId, permission || 'view', passwordHash, expireAt || null]);

    const shareUrl = `${req.protocol}://${req.get('host')}/share/${linkId}`;

    res.json({
      success: true,
      data: { shareUrl, linkId }
    });
  } catch (error) {
    console.error('공유 링크 생성 오류:', error);
    res.status(500).json({ success: false, error: '공유 링크 생성 중 오류가 발생했습니다.' });
  }
});

// 공유 링크로 문서 접근
router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const { password } = req.query;

    const share = await dbHelpers.get(`
      SELECT s.*, d.*, u.name as owner_name
      FROM shares s
      JOIN documents d ON s.doc_id = d.id
      JOIN users u ON d.owner_id = u.id
      WHERE s.link_id = ? AND s.is_active = 1
    `, [linkId]);

    if (!share) {
      return res.status(404).json({ success: false, error: '유효하지 않은 공유 링크입니다.' });
    }

    // 만료 확인
    if (share.expire_at && new Date(share.expire_at) < new Date()) {
      return res.status(410).json({ success: false, error: '만료된 공유 링크입니다.' });
    }

    // 비밀번호 확인
    if (share.password_hash) {
      if (!password) {
        return res.status(401).json({ 
          success: false, 
          error: '비밀번호가 필요합니다.',
          needsPassword: true 
        });
      }

      const isValidPassword = await bcrypt.compare(password, share.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: '잘못된 비밀번호입니다.' });
      }
    }

    res.json({
      success: true,
      data: {
        id: share.doc_id,
        title: share.title,
        description: share.description,
        tags: JSON.parse(share.tags || '[]'),
        fileUrl: share.file_url,
        fileName: share.file_name,
        ownerName: share.owner_name,
        permission: share.permission,
        createdAt: share.created_at
      }
    });
  } catch (error) {
    console.error('공유 문서 접근 오류:', error);
    res.status(500).json({ success: false, error: '문서 접근 중 오류가 발생했습니다.' });
  }
});

// 공유 설정 조회
router.get('/settings/:docId', authenticateToken, async (req, res) => {
  try {
    const { docId } = req.params;

    // 문서 소유자 확인
    const document = await dbHelpers.get(
      'SELECT * FROM documents WHERE id = ? AND owner_id = ?',
      [docId, req.user.id]
    );

    if (!document) {
      return res.status(404).json({ success: false, error: '문서를 찾을 수 없거나 권한이 없습니다.' });
    }

    const share = await dbHelpers.get(
      'SELECT * FROM shares WHERE doc_id = ? AND is_active = 1',
      [docId]
    );

    res.json({
      success: true,
      data: share ? {
        linkId: share.link_id,
        permission: share.permission,
        hasPassword: !!share.password_hash,
        expireAt: share.expire_at,
        shareUrl: `${req.protocol}://${req.get('host')}/share/${share.link_id}`
      } : null
    });
  } catch (error) {
    console.error('공유 설정 조회 오류:', error);
    res.status(500).json({ success: false, error: '공유 설정 조회 중 오류가 발생했습니다.' });
  }
});

// 공유 링크 비활성화
router.delete('/:docId', authenticateToken, async (req, res) => {
  try {
    const { docId } = req.params;

    // 문서 소유자 확인
    const document = await dbHelpers.get(
      'SELECT * FROM documents WHERE id = ? AND owner_id = ?',
      [docId, req.user.id]
    );

    if (!document) {
      return res.status(404).json({ success: false, error: '문서를 찾을 수 없거나 권한이 없습니다.' });
    }

    await dbHelpers.run(
      'UPDATE shares SET is_active = 0 WHERE doc_id = ?',
      [docId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('공유 링크 비활성화 오류:', error);
    res.status(500).json({ success: false, error: '공유 링크 비활성화 중 오류가 발생했습니다.' });
  }
});

module.exports = router;