const jwt = require('jsonwebtoken');
const { dbHelpers } = require('../models/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbHelpers.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ success: false, error: '유효하지 않은 사용자입니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: '유효하지 않은 토큰입니다.' });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증하고, 없어도 통과)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbHelpers.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    req.user = user;
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth
};