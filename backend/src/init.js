const { initDatabase } = require('./models/database');

// 데이터베이스 초기화 스크립트
const initializeDatabase = async () => {
  try {
    console.log('🚀 데이터베이스 초기화를 시작합니다...');
    
    await initDatabase();
    
    console.log('✅ 데이터베이스 초기화가 완료되었습니다.');
    console.log('📱 이제 서버를 시작할 수 있습니다: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    process.exit(1);
  }
};

// 스크립트가 직접 실행된 경우에만 초기화 실행
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };