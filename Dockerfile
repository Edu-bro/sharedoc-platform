# 멀티 스테이지 빌드를 사용하여 최적화된 컨테이너 생성

# Stage 1: 프론트엔드 빌드
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 프론트엔드 의존성 설치
COPY frontend/package*.json ./
RUN npm ci --only=production

# 프론트엔드 소스 복사 및 빌드
COPY frontend/ ./
RUN npm run build

# Stage 2: 백엔드 설정
FROM node:18-alpine AS backend

WORKDIR /app

# 시스템 패키지 설치 (SQLite 지원)
RUN apk add --no-cache sqlite

# 백엔드 의존성 설치
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# 공유 타입 정의 복사
COPY shared/ ../shared/

# 백엔드 소스 복사
COPY backend/ ./

# 프론트엔드 빌드 결과물 복사 (정적 파일 서빙용)
COPY --from=frontend-builder /app/frontend/build ./public

# 데이터 디렉토리 생성
RUN mkdir -p data uploads

# 데이터베이스 초기화
RUN npm run init-db

# 포트 노출
EXPOSE 3001

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const http=require('http'); http.get('http://localhost:3001/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# 프로덕션 모드로 서버 시작
CMD ["npm", "start"]