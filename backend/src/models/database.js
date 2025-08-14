const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// 데이터베이스 초기화
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Documents 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          tags TEXT, -- JSON 배열
          file_url TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          file_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_id) REFERENCES users (id)
        )
      `);

      // Shares 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS shares (
          doc_id TEXT NOT NULL,
          link_id TEXT PRIMARY KEY,
          permission TEXT NOT NULL CHECK (permission IN ('view', 'comment')),
          password_hash TEXT,
          expire_at DATETIME,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (doc_id) REFERENCES documents (id)
        )
      `);

      // View Logs 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS view_logs (
          id TEXT PRIMARY KEY,
          doc_id TEXT NOT NULL,
          user_id TEXT,
          page INTEGER NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_agent TEXT,
          FOREIGN KEY (doc_id) REFERENCES documents (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // AI Results 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS ai_results (
          id TEXT PRIMARY KEY,
          doc_id TEXT NOT NULL,
          run_id TEXT NOT NULL,
          scores TEXT NOT NULL, -- JSON 객체
          suggestions TEXT NOT NULL, -- JSON 배열
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (doc_id) REFERENCES documents (id)
        )
      `);

      // Review Requests 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS review_requests (
          id TEXT PRIMARY KEY,
          doc_id TEXT NOT NULL,
          purpose TEXT NOT NULL CHECK (purpose IN ('ir', 'proposal', 'other')),
          items TEXT NOT NULL, -- JSON 배열
          overall_required BOOLEAN DEFAULT 0,
          due_at DATETIME,
          invitees TEXT NOT NULL, -- JSON 배열
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (doc_id) REFERENCES documents (id)
        )
      `);

      // Reviews 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          request_id TEXT NOT NULL,
          reviewer_id TEXT,
          reviewer_name TEXT,
          scores TEXT NOT NULL, -- JSON 배열
          comments TEXT NOT NULL, -- JSON 배열
          overall TEXT,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (request_id) REFERENCES review_requests (id),
          FOREIGN KEY (reviewer_id) REFERENCES users (id)
        )
      `);

      // Comments 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          doc_id TEXT NOT NULL,
          author_id TEXT,
          author_name TEXT,
          page INTEGER NOT NULL,
          body TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (doc_id) REFERENCES documents (id),
          FOREIGN KEY (author_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.error('데이터베이스 초기화 실패:', err);
          reject(err);
        } else {
          console.log('✅ 데이터베이스 초기화 완료');
          resolve();
        }
      });
    });
  });
};

// 데이터베이스 헬퍼 함수들
const dbHelpers = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

module.exports = { db, dbHelpers, initDatabase };