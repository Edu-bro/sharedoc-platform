import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize,
  FileText
} from 'lucide-react';

const DocViewer = ({ document, currentPage, onPageChange }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [thumbnails, setThumbnails] = useState([]);
  const [totalPages, setTotalPages] = useState(10); // Mock 페이지 수
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock 썸네일 생성
    generateMockThumbnails();
  }, [document]);

  const generateMockThumbnails = () => {
    // 실제 구현에서는 PDF/PPT에서 썸네일 추출
    const mockThumbnails = Array.from({ length: totalPages }, (_, index) => ({
      page: index + 1,
      url: `data:image/svg+xml;base64,${btoa(`
        <svg width="120" height="160" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="160" fill="#f8f9fa" stroke="#dee2e6"/>
          <text x="60" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#6c757d">
            페이지 ${index + 1}
          </text>
          <rect x="10" y="20" width="100" height="8" fill="#e9ecef"/>
          <rect x="10" y="35" width="80" height="6" fill="#e9ecef"/>
          <rect x="10" y="48" width="90" height="6" fill="#e9ecef"/>
          <rect x="10" y="70" width="100" height="30" fill="#e3f2fd" stroke="#2196f3"/>
          <rect x="10" y="110" width="70" height="6" fill="#e9ecef"/>
          <rect x="10" y="123" width="85" height="6" fill="#e9ecef"/>
          <rect x="10" y="136" width="60" height="6" fill="#e9ecef"/>
        </svg>
      `)}`
    }));
    setThumbnails(mockThumbnails);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitToWidth = () => {
    setZoom(1);
    setRotation(0);
  };

  const getCurrentPageUrl = () => {
    // 실제 구현에서는 PDF/PPT 페이지 이미지 URL 반환
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="white" stroke="#dee2e6"/>
        
        <!-- 헤더 영역 -->
        <rect x="50" y="50" width="700" height="60" fill="#f8f9fa"/>
        <text x="400" y="85" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#212529">
          ${document.title} - 페이지 ${currentPage}
        </text>
        
        <!-- 콘텐츠 영역 -->
        <rect x="50" y="130" width="300" height="200" fill="#e3f2fd" stroke="#2196f3"/>
        <text x="200" y="240" text-anchor="middle" font-family="Arial" font-size="16" fill="#1976d2">
          차트/그래프 영역
        </text>
        
        <rect x="370" y="130" width="380" height="80" fill="#f5f5f5"/>
        <text x="380" y="150" font-family="Arial" font-size="14" fill="#333">
          • 주요 포인트 1
        </text>
        <text x="380" y="170" font-family="Arial" font-size="14" fill="#333">
          • 주요 포인트 2
        </text>
        <text x="380" y="190" font-family="Arial" font-size="14" fill="#333">
          • 주요 포인트 3
        </text>
        
        <!-- 하단 텍스트 영역 -->
        <rect x="50" y="350" width="700" height="4" fill="#dee2e6"/>
        <rect x="50" y="365" width="600" height="4" fill="#dee2e6"/>
        <rect x="50" y="380" width="650" height="4" fill="#dee2e6"/>
        <rect x="50" y="395" width="550" height="4" fill="#dee2e6"/>
        
        <!-- 페이지 번호 -->
        <text x="750" y="580" text-anchor="end" font-family="Arial" font-size="12" fill="#6c757d">
          ${currentPage} / ${totalPages}
        </text>
      </svg>
    `)}`;
  };

  return (
    <div className="h-full flex">
      {/* 썸네일 사이드바 */}
      <div className="w-32 bg-gray-50 border-r overflow-y-auto">
        <div className="p-2 space-y-2">
          {thumbnails.map((thumb) => (
            <button
              key={thumb.page}
              onClick={() => onPageChange(thumb.page)}
              className={`w-full p-1 rounded border-2 transition-colors ${
                currentPage === thumb.page
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={thumb.url}
                alt={`페이지 ${thumb.page}`}
                className="w-full h-auto rounded"
              />
              <p className="text-xs text-center mt-1 text-gray-600">
                {thumb.page}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 뷰어 */}
      <div className="flex-1 flex flex-col">
        {/* 뷰어 툴바 */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-sm text-gray-600 px-2">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="btn btn-secondary btn-sm"
            >
              <ZoomOut size={16} />
            </button>
            
            <span className="text-sm text-gray-600 px-2 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="btn btn-secondary btn-sm"
            >
              <ZoomIn size={16} />
            </button>
            
            <button
              onClick={handleRotate}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={16} />
            </button>
            
            <button
              onClick={handleFitToWidth}
              className="btn btn-secondary btn-sm"
            >
              <Maximize size={16} />
              맞춤
            </button>
          </div>
        </div>

        {/* 문서 뷰어 영역 */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="flex justify-center">
            <div 
              className="bg-white shadow-lg"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease'
              }}
            >
              {loading ? (
                <div className="w-96 h-96 flex items-center justify-center bg-gray-50">
                  <div className="spinner"></div>
                  <span className="ml-2">로딩 중...</span>
                </div>
              ) : (
                <img
                  src={getCurrentPageUrl()}
                  alt={`페이지 ${currentPage}`}
                  className="max-w-none"
                  style={{ width: '800px', height: '600px' }}
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;