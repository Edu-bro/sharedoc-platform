# 🚨 Vercel 404 에러 해결 방법

## 문제: Vercel에서 GitHub 저장소를 찾을 수 없음

### 원인
1. 저장소가 Private으로 설정되어 있음
2. GitHub 권한 문제
3. URL 형식 문제 (토큰 포함)

## ✅ 해결방법 1: 저장소 Public으로 변경

1. **GitHub.com** 접속
2. **Edu-bro/Sharedoc_2** 저장소로 이동
3. **Settings** 탭 클릭
4. 페이지 맨 아래로 스크롤
5. **"Danger Zone"** → **"Change repository visibility"**
6. **"Make public"** 클릭
7. 확인 메시지에서 저장소 이름 입력: `Edu-bro/Sharedoc_2`
8. **"I understand, make this repository public"** 클릭

## 🚀 해결방법 2: Vercel GitHub 연동

### A. GitHub App 설치
1. **Vercel Dashboard** → **Settings** → **Git Integration**
2. **GitHub** → **Configure**
3. **Edu-bro** 계정 선택
4. **Repository access** → **Selected repositories**
5. **Sharedoc_2** 저장소 선택

### B. 직접 Import
1. **Vercel Dashboard** → **New Project**
2. **Import Git Repository**
3. **GitHub** 선택
4. **Configure GitHub App** 클릭
5. 권한 승인 후 저장소 선택

## 🎯 배포 후 확인사항

### 환경 변수 설정 (필수)
```bash
JWT_SECRET=your-super-strong-secret-key-32-chars-minimum
NODE_ENV=production
DB_TYPE=postgres
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_SSL=true
AI_PROVIDER=mock
AI_ENABLED=true
CORS_ORIGIN=https://*.vercel.app
```

### 배포 설정
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install && cd frontend && npm install && cd ../backend && npm install`

## 🔧 문제 지속시

### 새 저장소로 재배포
```bash
# 새 저장소 생성 (GitHub.com에서)
# 예: sharedoc-platform-v2

# 로컬에서 새 저장소로 연결
git remote remove origin
git remote add origin https://github.com/Edu-bro/sharedoc-platform-v2.git
git branch -M main
git push -u origin main
```

## 🌐 배포 완료 후 접속 주소

- **메인**: `https://your-project.vercel.app`
- **대시보드**: `https://your-project.vercel.app/dashboard` 
- **API 테스트**: `https://your-project.vercel.app/api/health`

---

**💡 Tip**: GitHub 저장소를 Public으로 만드는 것이 가장 간단한 해결방법입니다!