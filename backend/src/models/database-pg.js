const { Pool } = require('pg');

// PostgreSQL 연결 설정 (와사비 DB)
const createPool = () => {
  const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sharedoc',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  console.log(`🐘 PostgreSQL 연결 설정:`, {
    user: config.user,
    host: config.host,
    database: config.database,
    port: config.port,
    ssl: !!config.ssl
  });

  return new Pool(config);
};

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};

// PostgreSQL 데이터베이스 초기화
const initPostgreSQL = async () => {
  const pool = getPool();
  
  try {
    console.log('🗄️  PostgreSQL 테이블 생성 중...');
    
    // Users 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Documents 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        tags JSONB DEFAULT '[]',
        file_url TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        file_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id)
      )
    `);

    // Shares 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shares (
        doc_id TEXT NOT NULL,
        link_id TEXT PRIMARY KEY,
        permission TEXT NOT NULL CHECK (permission IN ('view', 'comment')),
        password_hash TEXT,
        expire_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doc_id) REFERENCES documents (id)
      )
    `);

    // View Logs 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS view_logs (
        id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        user_id TEXT,
        page INTEGER NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        FOREIGN KEY (doc_id) REFERENCES documents (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // AI Results 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        run_id TEXT NOT NULL,
        scores JSONB NOT NULL,
        suggestions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doc_id) REFERENCES documents (id)
      )
    `);

    // Review Requests 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        purpose TEXT NOT NULL CHECK (purpose IN ('ir', 'proposal', 'other')),
        items JSONB NOT NULL,
        overall_required BOOLEAN DEFAULT false,
        due_at TIMESTAMP,
        invitees JSONB NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doc_id) REFERENCES documents (id)
      )
    `);

    // Reviews 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        reviewer_id TEXT,
        reviewer_name TEXT,
        scores JSONB NOT NULL,
        comments JSONB NOT NULL,
        overall TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES review_requests (id),
        FOREIGN KEY (reviewer_id) REFERENCES users (id)
      )
    `);

    // Comments 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        author_id TEXT,
        author_name TEXT,
        page INTEGER NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doc_id) REFERENCES documents (id),
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `);

    console.log('✅ PostgreSQL 테이블 생성 완료');
    
  } catch (error) {
    console.error('❌ PostgreSQL 초기화 실패:', error);
    throw error;
  }
};

// PostgreSQL 헬퍼 함수들
const pgHelpers = {
  query: async (text, params = []) => {
    const pool = getPool();
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },

  get: async (text, params = []) => {
    const result = await pgHelpers.query(text, params);
    return result.rows[0] || null;
  },

  all: async (text, params = []) => {
    const result = await pgHelpers.query(text, params);
    return result.rows;
  },

  run: async (text, params = []) => {
    const result = await pgHelpers.query(text, params);
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  }
};

module.exports = { 
  initPostgreSQL, 
  pgHelpers,
  getPool
};