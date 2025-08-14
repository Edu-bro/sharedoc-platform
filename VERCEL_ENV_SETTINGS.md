# 🔧 Vercel 환경 변수 필수 설정

## ⚡ 즉시 설정해야 할 환경 변수들

```bash
# 필수 보안 설정
JWT_SECRET=sharedoc-super-strong-jwt-secret-key-2024-production
NODE_ENV=production

# AI 설정
AI_PROVIDER=mock
AI_ENABLED=true

# CORS 설정 (중요!)
CORS_ORIGIN=https://*.vercel.app

# 데이터베이스 설정 (SQLite 기본)
DB_TYPE=sqlite

# 파일 업로드 제한
MAX_FILE_SIZE=52428800
```

## 🚨 자주 발생하는 문제들

### 1. JWT_SECRET 누락
- 증상: 로그인 실패, 500 에러
- 해결: 32자 이상의 강력한 키 설정

### 2. CORS_ORIGIN 잘못 설정
- 증상: API 호출 실패, CORS 에러
- 해결: `https://*.vercel.app` 또는 정확한 도메인

### 3. NODE_ENV 누락
- 증상: 개발 모드로 실행, 성능 저하
- 해결: `production` 설정

## 📝 설정 방법
1. Vercel Dashboard → Project Settings
2. Environment Variables 탭
3. 위 변수들을 하나씩 추가
4. Deploy 버튼 클릭하여 재배포