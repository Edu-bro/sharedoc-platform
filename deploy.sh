#!/bin/bash

# 파일공유 기반 IR·제안서 리뷰 플랫폼 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Sharedoc 플랫폼 배포 시작${NC}"
echo "================================================"

# 환경 변수 확인
if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}⚠️  JWT_SECRET 환경변수가 설정되지 않았습니다. 기본값을 사용합니다.${NC}"
    export JWT_SECRET="your-secret-key-change-in-production-$(date +%s)"
fi

if [ -z "$CORS_ORIGIN" ]; then
    echo -e "${YELLOW}⚠️  CORS_ORIGIN 환경변수가 설정되지 않았습니다. http://localhost:3000을 사용합니다.${NC}"
    export CORS_ORIGIN="http://localhost:3000"
fi

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되지 않았습니다.${NC}"
    echo "Docker를 설치하고 다시 시도해주세요: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose가 설치되지 않았습니다.${NC}"
    echo "Docker Compose를 설치하고 다시 시도해주세요."
    exit 1
fi

# 데이터 디렉토리 생성
echo -e "${BLUE}📁 데이터 디렉토리 생성 중...${NC}"
mkdir -p data uploads

# 기존 컨테이너 정리
echo -e "${BLUE}🧹 기존 컨테이너 정리 중...${NC}"
docker-compose down --remove-orphans || true

# Docker 이미지 빌드
echo -e "${BLUE}🏗️  Docker 이미지 빌드 중...${NC}"
docker-compose build

# 컨테이너 시작
echo -e "${BLUE}🚀 컨테이너 시작 중...${NC}"
docker-compose up -d

# 헬스 체크
echo -e "${BLUE}🔍 헬스 체크 중...${NC}"
sleep 10

MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 서버가 정상적으로 시작되었습니다!${NC}"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}⏳ 서버 시작 대기 중... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ 서버 시작에 실패했습니다.${NC}"
    echo -e "${BLUE}📋 로그 확인:${NC}"
    docker-compose logs --tail=50
    exit 1
fi

# 배포 완료 메시지
echo ""
echo -e "${GREEN}🎉 배포가 성공적으로 완료되었습니다!${NC}"
echo ""
echo -e "${BLUE}📱 접속 정보:${NC}"
echo -e "   • 웹 애플리케이션: ${YELLOW}http://localhost:3001${NC}"
echo -e "   • API 헬스체크: ${YELLOW}http://localhost:3001/api/health${NC}"
echo ""
echo -e "${BLUE}🔧 관리 명령어:${NC}"
echo -e "   • 로그 확인: ${YELLOW}docker-compose logs -f${NC}"
echo -e "   • 서비스 재시작: ${YELLOW}docker-compose restart${NC}"
echo -e "   • 서비스 중지: ${YELLOW}docker-compose down${NC}"
echo -e "   • 컨테이너 상태: ${YELLOW}docker-compose ps${NC}"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"