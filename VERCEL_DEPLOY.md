# 🚀 Vercel 배포 완전 가이드

## 🎯 원클릭 배포 (추천)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Edu-bro/Sharedoc_2)

**위 버튼을 클릭하면 자동으로 배포가 시작됩니다!**

## 📋 배포 단계별 설정

### 1단계: Vercel 계정 연결
- GitHub 계정으로 Vercel 로그인
- 저장소 접근 권한 승인

### 2단계: 프로젝트 설정
```
Project Name: sharedoc-platform
Framework Preset: Other
Root Directory: ./
Build Command: cd frontend && npm run build  
Output Directory: frontend/build
Install Command: npm install && cd frontend && npm install && cd ../backend && npm install
```

### 3단계: 환경 변수 설정 (필수)
```bash
# 보안 설정
JWT_SECRET=your-very-strong-secret-key-at-least-32-characters
NODE_ENV=production

# AI 설정  
AI_PROVIDER=mock
AI_ENABLED=true

# CORS 설정
CORS_ORIGIN=https://*.vercel.app

# === 데이터베이스 설정 ===
# 와사비 DB 사용시 (PostgreSQL)
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@host:port/database
DB_SSL=true

# 또는 SQLite 사용시 (기본값)
DB_TYPE=sqlite
```

### 4단계: 배포 실행
- "Deploy" 버튼 클릭
- 자동 빌드 및 배포 진행 (약 3-5분)
- 배포 완료 후 라이브 URL 생성

## 🔧 수동 설정 방법

### Vercel CLI 사용
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 배포
cd /path/to/Sharedoc_2
vercel

# 환경 변수 설정
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add AI_PROVIDER
```

### GitHub 연동 배포
1. Vercel Dashboard → "New Project"
2. GitHub에서 "Edu-bro/Sharedoc_2" 선택
3. 환경 변수 설정 후 Deploy

## 🌐 배포 후 접근 방법

### 메인 도메인
```
https://your-project-name.vercel.app
```

### 주요 페이지들
- **대시보드**: `https://your-project-name.vercel.app/dashboard`
- **업로드**: `https://your-project-name.vercel.app/upload`
- **문서 뷰어**: `https://your-project-name.vercel.app/doc/[id]`
- **공유 링크**: `https://your-project-name.vercel.app/share/[linkId]`
- **리뷰 폼**: `https://your-project-name.vercel.app/review/[requestId]`

### API 엔드포인트
- **헬스체크**: `https://your-project-name.vercel.app/api/health`
- **인증**: `https://your-project-name.vercel.app/api/auth/login`
- **문서**: `https://your-project-name.vercel.app/api/docs`

## 🛠 Vercel 최적화 설정

### Functions 설정
- **메모리**: 1024MB
- **최대 실행 시간**: 30초
- **최대 패키지 크기**: 50MB

### 환경별 도메인
- **Production**: main 브랜치 자동 배포
- **Preview**: PR별 미리보기 URL
- **Development**: 로컬 개발 환경

## 🔍 배포 후 확인 사항

### 1. 기본 기능 테스트
- [ ] 로그인 페이지 정상 작동
- [ ] 대시보드 로드 확인
- [ ] API 헬스체크 응답 확인

### 2. 파일 업로드 테스트
- [ ] PDF 업로드 테스트
- [ ] 파일 크기 제한 확인 (50MB)
- [ ] 메타데이터 저장 확인

### 3. AI 평가 테스트
- [ ] Mock AI 엔진 실행
- [ ] 점수 및 제안 표시 확인
- [ ] 차트 렌더링 확인

### 4. 공유 기능 테스트
- [ ] 공유 링크 생성 확인
- [ ] 비밀번호 보호 확인
- [ ] 권한 설정 확인

## 🚨 문제 해결

### 빌드 오류
```bash
# 로컬에서 빌드 테스트
cd frontend && npm run build
cd ../backend && npm start
```

### API 연결 오류
환경 변수 `CORS_ORIGIN`이 Vercel 도메인으로 설정되었는지 확인

### 데이터베이스 오류
Vercel은 서버리스 환경이므로 SQLite 파일이 초기화됩니다. 
프로덕션에서는 외부 데이터베이스 사용 권장.

## 📞 지원

배포 중 문제가 발생하면:
1. **Vercel 로그 확인**: Functions 탭에서 에러 로그 확인
2. **GitHub Issues**: 버그 리포트 작성
3. **Vercel 문서**: https://vercel.com/docs

---

**🎉 배포 완료 후 전세계 어디서든 IR·제안서 리뷰 플랫폼을 사용할 수 있습니다!**