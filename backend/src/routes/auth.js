const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../models/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// 간단 로그인 (이메일만으로)
router.post('/login', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: '이메일이 필요합니다.' });
    }

    // 사용자 조회 또는 생성
    let user = await dbHelpers.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      // 새 사용자 생성
      const userId = uuidv4();
      const userName = name || email.split('@')[0];
      
      await dbHelpers.run(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
        [userId, email, userName]
      );
      
      user = { id: userId, email, name: userName };
    }

    // JWT 토큰 생성
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ success: false, error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 프로필 조회
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbHelpers.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ success: false, error: '프로필 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;