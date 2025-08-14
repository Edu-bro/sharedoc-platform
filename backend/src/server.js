const app = require('./index');
const { initDatabase } = require('./models/database');

const PORT = process.env.PORT || 3001;

// 서버 시작 함수
const startServer = async () => {
  try {
    console.log('🚀 서버 시작 중...');
    
    // 데이터베이스 초기화
    console.log('📦 데이터베이스 초기화 중...');
    await initDatabase();
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`✅ 서버가 포트 ${PORT}에서 실행중입니다.`);
      console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 API 엔드포인트: http://localhost:${PORT}/api`);
      console.log('🎯 개발 환경에서 CORS가 활성화되어 있습니다.');
    });
    
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n🛑 서버 종료 중...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 서버 종료 중...');
  process.exit(0);
});

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
  console.error('💥 처리되지 않은 예외:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 처리되지 않은 Promise 거부:', reason);
  process.exit(1);
});

// 서버 시작
startServer();