const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../models/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 제한
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. PDF, PPT, DOC 파일만 업로드 가능합니다.'));
    }
  }
});

// 문서 업로드
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '파일이 필요합니다.' });
    }

    const { title, description, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, error: '제목이 필요합니다.' });
    }

    const docId = uuidv4();
    const fileUrl = `/uploads/${req.file.filename}`;
    const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];

    await dbHelpers.run(`
      INSERT INTO documents (
        id, owner_id, title, description, tags, 
        file_url, file_name, file_size, file_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId,
      req.user.id,
      title,
      description || '',
      JSON.stringify(tagsArray),
      fileUrl,
      req.file.originalname,
      req.file.size,
      req.file.mimetype
    ]);

    res.json({
      success: true,
      data: { docId }
    });
  } catch (error) {
    console.error('문서 업로드 오류:', error);
    res.status(500).json({ success: false, error: '문서 업로드 중 오류가 발생했습니다.' });
  }
});

// 문서 목록 조회
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q, type } = req.query;
    const userId = req.user.id;

    let whereClause = '';
    let params = [];

    if (type === 'sent') {
      whereClause = 'WHERE d.owner_id = ?';
      params.push(userId);
    } else if (type === 'received') {
      // 받은 문서 (리뷰 요청받은 문서들)
      whereClause = `
        WHERE d.id IN (
          SELECT DISTINCT rr.doc_id 
          FROM review_requests rr 
          WHERE JSON_EXTRACT(rr.invitees, '$') LIKE ?
        )
      `;
      params.push(`%"${req.user.email}"%`);
    } else {
      // 모든 문서 (소유한 것 + 리뷰 요청받은 것)
      whereClause = `
        WHERE d.owner_id = ? OR d.id IN (
          SELECT DISTINCT rr.doc_id 
          FROM review_requests rr 
          WHERE JSON_EXTRACT(rr.invitees, '$') LIKE ?
        )
      `;
      params.push(userId, `%"${req.user.email}"%`);
    }

    if (q) {
      whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
      whereClause += ' (d.title LIKE ? OR d.description LIKE ? OR d.tags LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const documents = await dbHelpers.all(`
      SELECT 
        d.*,
        u.name as owner_name,
        (SELECT COUNT(*) FROM view_logs vl WHERE vl.doc_id = d.id) as view_count,
        (SELECT COUNT(*) FROM comments c WHERE c.doc_id = d.id) as comment_count
      FROM documents d
      JOIN users u ON d.owner_id = u.id
      ${whereClause}
      ORDER BY d.created_at DESC
    `, params);

    const processedDocs = documents.map(doc => ({
      ...doc,
      tags: JSON.parse(doc.tags || '[]')
    }));

    res.json({
      success: true,
      data: processedDocs
    });
  } catch (error) {
    console.error('문서 목록 조회 오류:', error);
    res.status(500).json({ success: false, error: '문서 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 문서 상세 조회
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await dbHelpers.get(`
      SELECT 
        d.*,
        u.name as owner_name,
        u.email as owner_email
      FROM documents d
      JOIN users u ON d.owner_id = u.id
      WHERE d.id = ?
    `, [id]);

    if (!document) {
      return res.status(404).json({ success: false, error: '문서를 찾을 수 없습니다.' });
    }

    // 공유 정보 조회
    const shareInfo = await dbHelpers.get(`
      SELECT * FROM shares 
      WHERE doc_id = ? AND is_active = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [id]);

    // 통계 정보
    const [viewCount, commentCount] = await Promise.all([
      dbHelpers.get('SELECT COUNT(*) as count FROM view_logs WHERE doc_id = ?', [id]),
      dbHelpers.get('SELECT COUNT(*) as count FROM comments WHERE doc_id = ?', [id])
    ]);

    res.json({
      success: true,
      data: {
        ...document,
        tags: JSON.parse(document.tags || '[]'),
        share: shareInfo,
        stats: {
          viewCount: viewCount.count,
          commentCount: commentCount.count
        }
      }
    });
  } catch (error) {
    console.error('문서 상세 조회 오류:', error);
    res.status(500).json({ success: false, error: '문서 조회 중 오류가 발생했습니다.' });
  }
});

// 문서 열람 추적
router.post('/:id/track', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.body;

    if (typeof page !== 'number') {
      return res.status(400).json({ success: false, error: '페이지 번호가 필요합니다.' });
    }

    const logId = uuidv4();
    await dbHelpers.run(`
      INSERT INTO view_logs (id, doc_id, user_id, page, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [
      logId,
      id,
      req.user?.id || null,
      page,
      req.headers['user-agent'] || null
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('열람 추적 오류:', error);
    res.status(500).json({ success: false, error: '열람 추적 중 오류가 발생했습니다.' });
  }
});

module.exports = router;