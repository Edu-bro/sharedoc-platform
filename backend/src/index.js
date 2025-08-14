const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const docRoutes = require('./routes/documents');
const shareRoutes = require('./routes/share');
const aiRoutes = require('./routes/ai');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // IP당 최대 100 요청
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: '요청하신 리소스를 찾을 수 없습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;