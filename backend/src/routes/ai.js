const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// AI 평가 실행
router.post('/:docId/run', authenticateToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const { options } = req.body;

    // 문서 존재 확인
    const document = await dbHelpers.get('SELECT * FROM documents WHERE id = ?', [docId]);
    
    if (!document) {
      return res.status(404).json({ success: false, error: '문서를 찾을 수 없습니다.' });
    }

    // AI 분석 실행
    const runId = uuidv4();
    const result = await aiService.analyzeDocument(document, options);

    // 결과 저장
    await dbHelpers.run(`
      INSERT INTO ai_results (id, doc_id, run_id, scores, suggestions)
      VALUES (?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      docId,
      runId,
      JSON.stringify(result.scores),
      JSON.stringify(result.suggestions)
    ]);

    res.json({
      success: true,
      data: {
        runId,
        scores: result.scores,
        suggestions: result.suggestions
      }
    });
  } catch (error) {
    console.error('AI 평가 실행 오류:', error);
    res.status(500).json({ success: false, error: 'AI 평가 실행 중 오류가 발생했습니다.' });
  }
});

// AI 평가 결과 조회
router.get('/:docId/result', authenticateToken, async (req, res) => {
  try {
    const { docId } = req.params;

    const result = await dbHelpers.get(`
      SELECT * FROM ai_results 
      WHERE doc_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [docId]);

    if (!result) {
      return res.status(404).json({ success: false, error: 'AI 평가 결과를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: {
        id: result.id,
        runId: result.run_id,
        scores: JSON.parse(result.scores),
        suggestions: JSON.parse(result.suggestions),
        createdAt: result.created_at
      }
    });
  } catch (error) {
    console.error('AI 평가 결과 조회 오류:', error);
    res.status(500).json({ success: false, error: 'AI 평가 결과 조회 중 오류가 발생했습니다.' });
  }
});

// AI 평가 히스토리 조회
router.get('/:docId/history', authenticateToken, async (req, res) => {
  try {
    const { docId } = req.params;

    const results = await dbHelpers.all(`
      SELECT * FROM ai_results 
      WHERE doc_id = ? 
      ORDER BY created_at DESC
    `, [docId]);

    const processedResults = results.map(result => ({
      id: result.id,
      runId: result.run_id,
      scores: JSON.parse(result.scores),
      suggestions: JSON.parse(result.suggestions),
      createdAt: result.created_at
    }));

    res.json({
      success: true,
      data: processedResults
    });
  } catch (error) {
    console.error('AI 평가 히스토리 조회 오류:', error);
    res.status(500).json({ success: false, error: 'AI 평가 히스토리 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;