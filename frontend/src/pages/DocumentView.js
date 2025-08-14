import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI, shareAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import DocViewer from '../components/DocViewer';
import RightTabs from '../components/RightTabs';
import ShareModal from '../components/ShareModal';
import { 
  ArrowLeft, 
  Share2, 
  Eye, 
  MessageCircle, 
  Calendar,
  User,
  Settings,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  useEffect(() => {
    // URL 쿼리 파라미터에서 탭 정보 읽기
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['ai', 'human', 'comments'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getById(id);
      
      if (response.success) {
        setDocument(response.data);
      } else {
        toast.error('문서를 찾을 수 없습니다.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('문서 로드 오류:', error);
      toast.error('문서 로드 중 오류가 발생했습니다.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    
    // 페이지 조회 추적
    try {
      await documentAPI.trackView(id, page);
    } catch (error) {
      console.error('페이지 조회 추적 오류:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // URL 쿼리 파라미터 업데이트
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = user && document && document.owner_id === user.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner"></div>
        <span className="ml-2">문서 로드 중...</span>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">문서를 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={16} />
              대시보드
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  {document.owner_name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(document.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  {document.stats?.viewCount || 0}회 조회
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  {document.stats?.commentCount || 0}개 댓글
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={handleShare}
                className="btn btn-secondary btn-sm"
              >
                <Share2 size={16} />
                공유
              </button>
            )}
            
            <a
              href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${document.file_url}`}
              download={document.file_name}
              className="btn btn-secondary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={16} />
              다운로드
            </a>

            {isOwner && (
              <button className="btn btn-secondary btn-sm">
                <Settings size={16} />
                설정
              </button>
            )}
          </div>
        </div>

        {document.description && (
          <p className="text-gray-600 mt-2">{document.description}</p>
        )}

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {document.tags.map((tag, index) => (
              <span key={index} className="badge badge-secondary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex">
        {/* 문서 뷰어 */}
        <div className="flex-1 bg-gray-100">
          <DocViewer
            document={document}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        {/* 우측 탭 */}
        <div className="w-96 bg-white border-l">
          <RightTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            document={document}
            currentPage={currentPage}
            isOwner={isOwner}
          />
        </div>
      </div>

      {/* 공유 모달 */}
      {showShareModal && (
        <ShareModal
          document={document}
          onClose={() => setShowShareModal(false)}
          onUpdate={loadDocument}
        />
      )}
    </div>
  );
};

export default DocumentView;