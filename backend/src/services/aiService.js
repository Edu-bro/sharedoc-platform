const fs = require('fs');
const path = require('path');

// Mock AI 서비스 - 규칙 기반 분석
class MockAIService {
  async analyzeDocument(document, options = {}) {
    console.log(`🤖 AI 분석 시작: ${document.title}`);
    
    // 파일 내용 분석 시뮬레이션
    const content = await this.extractContent(document);
    const analysis = this.performAnalysis(content, document);
    
    console.log(`✅ AI 분석 완료: ${document.title}`);
    return analysis;
  }

  async extractContent(document) {
    // 실제 구현에서는 PDF/PPT 파싱을 수행
    // 현재는 파일명과 제목을 기반으로 모의 분석
    const fileName = document.file_name.toLowerCase();
    const title = document.title.toLowerCase();
    const description = (document.description || '').toLowerCase();
    
    return {
      fileName,
      title,
      description,
      text: `${title} ${description}`.toLowerCase(),
      // 모의 페이지 수 (실제로는 파일에서 추출)
      pageCount: this.estimatePageCount(fileName)
    };
  }

  estimatePageCount(fileName) {
    // 파일명 기반으로 페이지 수 추정
    if (fileName.includes('pitch') || fileName.includes('ir')) {
      return Math.floor(Math.random() * 15) + 10; // 10-25 페이지
    }
    return Math.floor(Math.random() * 20) + 5; // 5-25 페이지
  }

  performAnalysis(content) {
    const scores = {
      market: this.analyzeMarket(content),
      story: this.analyzeStory(content),
      design: this.analyzeDesign(content),
      finance: this.analyzeFinance(content)
    };

    const suggestions = this.generateSuggestions(scores, content);

    return { scores, suggestions };
  }

  analyzeMarket(content) {
    let score = 2; // 기본 점수
    
    // 시장 관련 키워드 체크
    const marketKeywords = [
      'tam', 'sam', 'som', '시장', 'market', 'addressable', 
      '규모', '성장', 'cagr', '매출', '점유율'
    ];
    
    const keywordHits = marketKeywords.filter(keyword => 
      content.text.includes(keyword)
    ).length;
    
    // 숫자 + 단위 패턴 (시장 규모 수치)
    const numberPattern = /\d+\s*(조|억|만|천|백만|million|billion|trillion)/g;
    const numberMatches = content.text.match(numberPattern) || [];
    
    score += Math.min(keywordHits * 0.3, 1.5);
    score += Math.min(numberMatches.length * 0.5, 1.5);
    
    return Math.min(Math.round(score * 10) / 10, 5);
  }

  analyzeStory(content) {
    let score = 2.5;
    
    // 스토리 구조 키워드
    const storyKeywords = [
      '문제', '해결', '가설', '로드맵', 'problem', 'solution', 
      '비전', '미션', '목표', '전략', '차별화'
    ];
    
    const keywordHits = storyKeywords.filter(keyword => 
      content.text.includes(keyword)
    ).length;
    
    // 페이지 수 적정성 (10-20페이지가 적절)
    const pageScore = content.pageCount >= 10 && content.pageCount <= 20 ? 1 : 0.5;
    
    score += Math.min(keywordHits * 0.2, 1);
    score += pageScore;
    
    return Math.min(Math.round(score * 10) / 10, 5);
  }

  analyzeDesign(content) {
    let score = 3;
    
    // 차트/표 관련 키워드
    const visualKeywords = [
      '차트', '그래프', '표', '도표', 'chart', 'graph', 'table',
      '데이터', '지표', '통계', '분석'
    ];
    
    const keywordHits = visualKeywords.filter(keyword => 
      content.text.includes(keyword)
    ).length;
    
    // 제목 길이 (너무 길면 감점)
    const titleLength = content.title.length;
    const titleScore = titleLength > 50 ? -0.5 : 0;
    
    score += Math.min(keywordHits * 0.3, 1);
    score += titleScore;
    
    return Math.min(Math.max(Math.round(score * 10) / 10, 1), 5);
  }

  analyzeFinance(content) {
    let score = 2;
    
    // 재무 관련 키워드
    const financeKeywords = [
      '매출', '수익', '이익', '손익', 'revenue', 'profit', 'ebitda',
      'cac', 'ltv', 'gmv', 'arpu', '마진', '비용', '투자'
    ];
    
    const keywordHits = financeKeywords.filter(keyword => 
      content.text.includes(keyword)
    ).length;
    
    // 단위 표기 체크 (%, 원, 달러 등)
    const unitPattern = /\d+\s*[%원달러$₩]/g;
    const unitMatches = content.text.match(unitPattern) || [];
    
    score += Math.min(keywordHits * 0.4, 2);
    score += Math.min(unitMatches.length * 0.3, 1);
    
    return Math.min(Math.round(score * 10) / 10, 5);
  }

  generateSuggestions(scores, content) {
    const suggestions = [];
    
    if (scores.market < 3) {
      suggestions.push('시장 규모 수치와 출처(연도)를 명시하세요.');
      suggestions.push('TAM, SAM, SOM 분석을 추가하여 시장 기회를 구체화하세요.');
    }
    
    if (scores.story < 3) {
      suggestions.push('문제-해결 구조를 명확히 하여 스토리라인을 강화하세요.');
      suggestions.push('경쟁우위 슬라이드를 초반에 배치해 설득력을 높이세요.');
    }
    
    if (scores.design < 3) {
      suggestions.push('핵심 지표를 차트 형태로 요약하세요.');
      suggestions.push('슬라이드당 텍스트 양을 줄이고 시각적 요소를 늘리세요.');
    }
    
    if (scores.finance < 3) {
      suggestions.push('재무 모델과 핵심 지표(CAC, LTV 등)를 추가하세요.');
      suggestions.push('수익 구조와 단위 경제학을 명확히 설명하세요.');
    }
    
    // 전체 점수가 높으면 긍정적 피드백
    const avgScore = (scores.market + scores.story + scores.design + scores.finance) / 4;
    if (avgScore >= 4) {
      suggestions.unshift('전반적으로 훌륭한 자료입니다! 세부 사항만 보완하면 됩니다.');
    }
    
    return suggestions;
  }
}

// Deepseek API 서비스 (향후 구현)
class DeepseekAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  async analyzeDocument(document, options = {}) {
    // TODO: Deepseek API 연동 구현
    throw new Error('Deepseek API 연동은 아직 구현되지 않았습니다.');
  }
}

// 팩토리 함수
function createAIService() {
  const provider = process.env.AI_PROVIDER || 'mock';
  
  switch (provider) {
    case 'deepseek':
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        console.warn('⚠️  DEEPSEEK_API_KEY가 설정되지 않았습니다. Mock AI를 사용합니다.');
        return new MockAIService();
      }
      return new DeepseekAIService(apiKey);
    
    case 'mock':
    default:
      return new MockAIService();
  }
}

module.exports = createAIService();