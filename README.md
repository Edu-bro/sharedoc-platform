# 📄 파일공유 기반 IR·제안서 리뷰 플랫폼

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

> IR 자료 및 제안서에 대한 AI 평가와 전문가 리뷰를 통합한 협업 플랫폼

## ✨ 주요 기능

### 🚀 핵심 기능
- **📤 스마트 문서 업로드**: PDF, PPT, DOC 파일 지원, 드래그앤드롭
- **🤖 AI 자동 평가**: 시장성, 스토리텔링, 디자인, 재무 모델 4개 영역 분석
- **👥 전문가 리뷰**: 구조화된 평가 항목과 초대 시스템
- **💬 실시간 피드백**: 페이지별 상세 코멘트 시스템
- **🔗 안전한 공유**: 비밀번호 보호, 만료일 설정 가능한 공유 링크
- **📊 인사이트 대시보드**: 조회수, 댓글, 평가 현황 한눈에 보기

### 🎯 사용자 경험
- **직관적인 한글 UI**: 비즈니스 사용자 친화적 인터페이스
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 최적화
- **빠른 시작**: 이메일 기반 간편 로그인
- **실시간 협업**: 즉시 반영되는 댓글과 평가

## 🛠 기술 스택

### Frontend
- **React 18** - 최신 React 기능 활용
- **React Router 6** - SPA 라우팅
- **Styled Components** - CSS-in-JS 스타일링
- **React Hot Toast** - 사용자 알림
- **Recharts** - 데이터 시각화
- **Lucide React** - 아이콘 시스템

### Backend
- **Node.js 18+** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **SQLite** - 경량 데이터베이스
- **JWT** - 토큰 기반 인증
- **Multer** - 파일 업로드 처리
- **bcryptjs** - 비밀번호 암호화

### DevOps & 배포
- **Docker** - 컨테이너화
- **GitHub Actions** - CI/CD 파이프라인
- **Vercel/Netlify** - 서버리스 배포 지원

## 시작하기

### 빠른 시작 (권장)
```bash
# 개발 서버 시작 (의존성 설치 + 데이터베이스 초기화 + 서버 실행)
./start-dev.sh
```

### 수동 설정

#### 1. 의존성 설치
```bash
npm run install:all
```

#### 2. 데이터베이스 초기화
```bash
cd backend && npm run init-db && cd ..
```

#### 3. 개발 서버 실행
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

### 개별 서버 실행
```bash
# 백엔드만 실행
cd backend && npm run dev

# 프론트엔드만 실행  
cd frontend && npm start
```

### 빌드
```bash
npm run build
```

## 🚀 배포 방법

### 1. Docker를 이용한 로컬 배포 (권장)

```bash
# 저장소 클론
git clone https://github.com/Edu-bro/Sharedoc_2.git
cd Sharedoc_2

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 JWT_SECRET 등 설정

# Docker로 배포 (원클릭 배포)
./deploy.sh
```

### 2. Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Edu-bro/Sharedoc_2)

1. Vercel에서 프로젝트 import
2. 환경 변수 설정:
   - `JWT_SECRET`: 강력한 시크릿 키
   - `NODE_ENV`: `production`
3. 자동 배포 완료

### 3. Netlify 배포

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Edu-bro/Sharedoc_2)

1. Netlify에서 프로젝트 import
2. Build settings: `netlify.toml` 자동 인식
3. 환경 변수 설정 후 배포

### 4. 클라우드 서버 배포

```bash
# 서버에서 실행
git clone https://github.com/Edu-bro/Sharedoc_2.git
cd Sharedoc_2

# 환경 변수 설정
export JWT_SECRET="your-strong-secret"
export CORS_ORIGIN="https://yourdomain.com"

# Docker Compose로 배포
docker-compose up -d

# 헬스 체크
curl http://localhost:3001/api/health
```

## 🔧 환경 설정

### 필수 환경 변수

```bash
# 보안 설정 (반드시 변경)
JWT_SECRET="your-very-strong-secret-key"
CORS_ORIGIN="https://yourdomain.com"

# AI 설정
AI_PROVIDER="mock"  # 또는 "deepseek"
AI_ENABLED="true"
DEEPSEEK_API_KEY="your-deepseek-key"  # AI_PROVIDER=deepseek인 경우

# 서버 설정
PORT="3001"
NODE_ENV="production"
```

### GitHub Actions 시크릿

CI/CD를 위한 GitHub Secrets 설정:

```
JWT_SECRET: 프로덕션 JWT 시크릿
DOCKER_HUB_USERNAME: Docker Hub 사용자명
DOCKER_HUB_ACCESS_TOKEN: Docker Hub 액세스 토큰
PRODUCTION_HOST: 배포 서버 IP
PRODUCTION_USER: 서버 사용자명
PRODUCTION_SSH_KEY: SSH 프라이빗 키
```

## 📁 프로젝트 구조

```
📦 Sharedoc_2/
├── 🎨 frontend/                 # React 클라이언트
│   ├── src/
│   │   ├── components/          # 재사용 컴포넌트
│   │   ├── pages/              # 페이지 컴포넌트
│   │   ├── hooks/              # 커스텀 훅
│   │   ├── contexts/           # React Context
│   │   └── utils/              # 유틸리티 함수
│   └── public/                 # 정적 파일
├── ⚡ backend/                  # Express.js 서버
│   ├── src/
│   │   ├── routes/             # API 라우트
│   │   ├── models/             # 데이터베이스 모델
│   │   ├── services/           # 비즈니스 로직
│   │   └── middleware/         # 미들웨어
│   └── uploads/                # 업로드된 파일
├── 🔧 shared/                   # 공통 타입 정의
├── 🐳 docker-compose.yml        # Docker 설정
├── 🚀 .github/workflows/        # CI/CD 파이프라인
└── 📚 docs/                     # 문서
```

## 🎮 사용 가이드

### 관리자 기능
1. **문서 업로드**: 드래그앤드롭으로 간편 업로드
2. **AI 평가 실행**: 원클릭으로 자동 분석 시작
3. **전문가 초대**: 이메일로 리뷰어 초대
4. **공유 관리**: 보안 설정이 가능한 링크 생성

### 리뷰어 기능
1. **문서 열람**: 페이지별 확대/축소 가능한 뷰어
2. **구조화된 평가**: 항목별 1-5점 스코어링
3. **상세 피드백**: 페이지별 구체적 코멘트
4. **종합 리뷰**: 전체적인 평가와 개선사항 제안

## 🔐 보안

- **JWT 기반 인증**: 안전한 토큰 인증
- **파일 검증**: 허용된 파일 형식만 업로드
- **CORS 제한**: 지정된 도메인만 접근
- **레이트 리미팅**: API 남용 방지
- **입력 검증**: XSS, 인젝션 공격 방지

자세한 보안 정책은 [SECURITY.md](./SECURITY.md)를 참조하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 확인하세요.

## 🙋‍♂️ 지원

- 📖 [문서](./docs/)
- 🐛 [이슈 리포트](https://github.com/Edu-bro/Sharedoc_2/issues)
- 💬 [토론](https://github.com/Edu-bro/Sharedoc_2/discussions)

---

<div align="center">
  <p>⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!</p>
  <p>Made with ❤️ by <a href="https://github.com/Edu-bro">Edu-bro</a></p>
</div>