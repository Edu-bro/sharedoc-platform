#!/bin/bash

# 파일공유 기반 IR·제안서 리뷰 플랫폼 개발 서버 시작 스크립트

echo "🚀 파일공유 기반 IR·제안서 리뷰 플랫폼 개발 서버 시작"
echo "================================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 프로젝트 루트 디렉토리에서 실행해주세요.${NC}"
    exit 1
fi

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
    echo "Node.js를 설치하고 다시 시도해주세요: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js 버전: ${NODE_VERSION}${NC}"

# 의존성 설치 확인
echo -e "${BLUE}📦 의존성 설치 확인 중...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  의존성이 설치되지 않았습니다. 설치를 시작합니다...${NC}"
    npm run install:all
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  백엔드 의존성 설치 중...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  프론트엔드 의존성 설치 중...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ 의존성 설치 완료${NC}"

# uploads 디렉토리 생성
mkdir -p backend/uploads
echo -e "${GREEN}✅ 업로드 디렉토리 생성 완료${NC}"

# 데이터베이스 초기화 (필요한 경우)
if [ ! -f "backend/database.sqlite" ]; then
    echo -e "${BLUE}🗄️  데이터베이스 초기화 중...${NC}"
    cd backend && npm run init-db && cd ..
fi

echo -e "${GREEN}✅ 데이터베이스 준비 완료${NC}"

# 개발 서버 시작
echo ""
echo -e "${BLUE}🚀 개발 서버 시작 중...${NC}"
echo -e "${YELLOW}프론트엔드: http://localhost:3000${NC}"
echo -e "${YELLOW}백엔드: http://localhost:3001${NC}"
echo ""
echo -e "${GREEN}Ctrl+C로 서버를 종료할 수 있습니다.${NC}"
echo ""

# 개발 서버 실행
npm run dev