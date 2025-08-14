// Netlify Functions용 백엔드 서버 래퍼
const serverless = require('serverless-http');
const app = require('../../backend/src/index');

// Netlify Functions는 서버리스 환경이므로 데이터베이스 초기화가 필요
const { initDatabase } = require('../../backend/src/models/database');

let isInitialized = false;

const handler = async (event, context) => {
  // 첫 실행 시에만 데이터베이스 초기화
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
      console.log('✅ Netlify Functions에서 데이터베이스 초기화 완료');
    } catch (error) {
      console.error('❌ Netlify Functions 데이터베이스 초기화 실패:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: '서버 초기화 오류' })
      };
    }
  }

  // Express 앱을 서버리스 함수로 래핑
  const serverlessHandler = serverless(app);
  return await serverlessHandler(event, context);
};

module.exports.handler = handler;