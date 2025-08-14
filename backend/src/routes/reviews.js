const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../models/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 리뷰 요청 생성
router.post('/:docId/requests', authenticateToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const { purpose, items, overallRequired, dueAt, invitees } = req.body;

    // 문서 소유자 확인
    const document = await dbHelpers.get(
      'SELECT * FROM documents WHERE id = ? AND owner_id = ?',
      [docId, req.user.id]
    );

    if (!document) {
      return res.status(404).json({ success: false, error: '문서를 찾을 수 없거나 권한이 없습니다.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: '평가 항목이 필요합니다.' });
    }

    if (!invitees || !Array.isArray(invitees) || invitees.length === 0) {
      return res.status(400).json({ success: false, error: '초대할 리뷰어가 필요합니다.' });
    }

    const requestId = uuidv4();
    
    await dbHelpers.run(`
      INSERT INTO review_requests (
        id, doc_id, purpose, items, overall_required, due_at, invitees, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      requestId,
      docId,
      purpose || 'other',
      JSON.stringify(items),
      overallRequired || false,
      dueAt || null,
      JSON.stringify(invitees)
    ]);

    // 초대 링크 생성
    const inviteLink = `${req.protocol}://${req.get('host')}/review/${requestId}`;

    res.json({
      success: true,
      data: {
        requestId,
        inviteLink
      }
    });
  } catch (error) {
    console.error('리뷰 요청 생성 오류:', error);
    res.status(500).json({ success: false, error: '리뷰 요청 생성 중 오류가 발생했습니다.' });
  }
});

// 문서별 리뷰 요청 목록 조회
router.get('/:docId/requests', authenticateToken, async (req, res) => {
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

    const requests = await dbHelpers.all(`
      SELECT 
        rr.*,
        COUNT(r.id) as response_count
      FROM review_requests rr
      LEFT JOIN reviews r ON rr.id = r.request_id
      WHERE rr.doc_id = ?
      GROUP BY rr.id
      ORDER BY rr.created_at DESC
    `, [docId]);

    const processedRequests = requests.map(request => ({
      ...request,
      items: JSON.parse(request.items),
      invitees: JSON.parse(request.invitees)
    }));

    res.json({
      success: true,
      data: processedRequests
    });
  } catch (error) {
    console.error('리뷰 요청 목록 조회 오류:', error);
    res.status(500).json({ success: false, error: '리뷰 요청 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 리뷰 폼 조회 (리뷰어용)
router.get('/requests/:requestId', optionalAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await dbHelpers.get(`
      SELECT 
        rr.*,
        d.title as doc_title,
        d.file_url,
        u.name as requester_name
      FROM review_requests rr
      JOIN documents d ON rr.doc_id = d.id
      JOIN users u ON d.owner_id = u.id
      WHERE rr.id = ?
    `, [requestId]);

    if (!request) {
      return res.status(404).json({ success: false, error: '리뷰 요청을 찾을 수 없습니다.' });
    }

    // 마감일 확인
    if (request.due_at && new Date(request.due_at) < new Date()) {
      return res.status(410).json({ success: false, error: '마감된 리뷰 요청입니다.' });
    }

    // 기존 응답 확인 (이메일 기반)
    let existingReview = null;
    if (req.user) {
      existingReview = await dbHelpers.get(
        'SELECT * FROM reviews WHERE request_id = ? AND reviewer_id = ?',
        [requestId, req.user.id]
      );
    }

    res.json({
      success: true,
      data: {
        id: request.id,
        docId: request.doc_id,
        docTitle: request.doc_title,
        fileUrl: request.file_url,
        requesterName: request.requester_name,
        purpose: request.purpose,
        items: JSON.parse(request.items),
        overallRequired: request.overall_required,
        dueAt: request.due_at,
        existingReview: existingReview ? {
          scores: JSON.parse(existingReview.scores),
          comments: JSON.parse(existingReview.comments),
          overall: existingReview.overall,
          submittedAt: existingReview.submitted_at
        } : null
      }
    });
  } catch (error) {
    console.error('리뷰 폼 조회 오류:', error);
    res.status(500).json({ success: false, error: '리뷰 폼 조회 중 오류가 발생했습니다.' });
  }
});

// 리뷰 제출
router.post('/requests/:requestId/submit', optionalAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { scores, comments, overall, reviewerName } = req.body;

    // 리뷰 요청 확인
    const request = await dbHelpers.get(
      'SELECT * FROM review_requests WHERE id = ?',
      [requestId]
    );

    if (!request) {
      return res.status(404).json({ success: false, error: '리뷰 요청을 찾을 수 없습니다.' });
    }

    // 마감일 확인
    if (request.due_at && new Date(request.due_at) < new Date()) {
      return res.status(410).json({ success: false, error: '마감된 리뷰 요청입니다.' });
    }

    // 필수 항목 확인
    if (!scores || !Array.isArray(scores)) {
      return res.status(400).json({ success: false, error: '점수가 필요합니다.' });
    }

    if (request.overall_required && !overall) {
      return res.status(400).json({ success: false, error: '종합 코멘트가 필요합니다.' });
    }

    // 기존 리뷰 확인 및 업데이트/생성
    const existingReview = req.user ? 
      await dbHelpers.get(
        'SELECT * FROM reviews WHERE request_id = ? AND reviewer_id = ?',
        [requestId, req.user.id]
      ) : null;

    const reviewId = existingReview?.id || uuidv4();

    if (existingReview) {
      // 기존 리뷰 업데이트
      await dbHelpers.run(`
        UPDATE reviews 
        SET scores = ?, comments = ?, overall = ?, submitted_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        JSON.stringify(scores),
        JSON.stringify(comments || []),
        overall || null,
        reviewId
      ]);
    } else {
      // 새 리뷰 생성
      await dbHelpers.run(`
        INSERT INTO reviews (
          id, request_id, reviewer_id, reviewer_name, scores, comments, overall
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        reviewId,
        requestId,
        req.user?.id || null,
        req.user?.name || reviewerName || '익명',
        JSON.stringify(scores),
        JSON.stringify(comments || []),
        overall || null
      ]);
    }

    res.json({
      success: true,
      data: { reviewId }
    });
  } catch (error) {
    console.error('리뷰 제출 오류:', error);
    res.status(500).json({ success: false, error: '리뷰 제출 중 오류가 발생했습니다.' });
  }
});

// 리뷰 응답 목록 조회 (요청자용)
router.get('/requests/:requestId/responses', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    // 요청자 권한 확인
    const request = await dbHelpers.get(`
      SELECT rr.*, d.owner_id
      FROM review_requests rr
      JOIN documents d ON rr.doc_id = d.id
      WHERE rr.id = ? AND d.owner_id = ?
    `, [requestId, req.user.id]);

    if (!request) {
      return res.status(404).json({ success: false, error: '리뷰 요청을 찾을 수 없거나 권한이 없습니다.' });
    }

    const responses = await dbHelpers.all(`
      SELECT * FROM reviews 
      WHERE request_id = ?
      ORDER BY submitted_at DESC
    `, [requestId]);

    const processedResponses = responses.map(response => ({
      id: response.id,
      reviewerName: response.reviewer_name,
      scores: JSON.parse(response.scores),
      comments: JSON.parse(response.comments),
      overall: response.overall,
      submittedAt: response.submitted_at
    }));

    res.json({
      success: true,
      data: processedResponses
    });
  } catch (error) {
    console.error('리뷰 응답 목록 조회 오류:', error);
    res.status(500).json({ success: false, error: '리뷰 응답 목록 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;