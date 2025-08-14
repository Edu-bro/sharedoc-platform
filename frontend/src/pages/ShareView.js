import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shareAPI, documentAPI, commentAPI } from '../utils/api';
import DocViewer from '../components/DocViewer';
import CommentsTab from '../components/CommentsTab';
import { 
  FileText, 
  User, 
  Calendar, 
  Eye, 
  MessageCircle,
  Lock,
  AlertCircle,
  Download,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ShareView = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadSharedDocument();
  }, [linkId]);

  const loadSharedDocument = async (pwd = '') => {
    try {
      setLoading(true);
      setNeedsPassword(false);
      
      const response = await shareAPI.getByLink(linkId, pwd);
      
      if (response.success) {
        setDocument(response.data);
        setPassword('');
        
        // 페이지 조회 추적
        trackView(response.data.id, 1);
      } else {
        if (response.needsPassword) {
          setNeedsPassword(true);
        } else {
          toast.error(response.error || '문서에 접근할 수 없습니다.');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('공유 문서 로드 오류:', error);
      if (error.needsPassword) {
        setNeedsPassword(true);
      } else {
        toast.error('문서 로드 중 오류가 발생했습니다.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }

    setSubmittingPassword(true);
    await loadSharedDocument(password.trim());
    setSubmittingPassword(false);
  };

  const trackView = async (docId, page) => {
    try {
      await documentAPI.trackView(docId, page);
    } catch (error) {
      console.error('페이지 조회 추적 오류:', error);
    }
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    
    if (document) {
      await trackView(document.id, page);
    }
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

  const canComment = document?.permission === 'comment';

  // 비밀번호 입력 화면
  if (needsPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full m-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                비밀번호가 필요합니다
              </h2>
              <p className="text-gray-600 mb-6">
                이 문서는 비밀번호로 보호되어 있습니다.
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input
                  type="password"
                  className="input"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submittingPassword}
                  autoFocus
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn btn-secondary flex-1"
                    disabled={submittingPassword}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={submittingPassword || !password.trim()}
                  >
                    {submittingPassword ? (
                      <>
                        <div className="spinner"></div>
                        확인 중...
                      </>
                    ) : (
                      '확인'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
        <span className="ml-2">문서 로드 중...</span>
      </div>
    );
  }

  // 문서가 없는 경우
  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            문서에 접근할 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            링크가 유효하지 않거나 만료되었을 수 있습니다.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={16} />
              홈으로
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  {document.ownerName}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(document.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  {document.permission === 'view' ? '읽기 전용' : '댓글 작성 가능'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canComment && (
              <button
                onClick={() => setShowComments(!showComments)}
                className={`btn btn-sm ${showComments ? 'btn-primary' : 'btn-secondary'}`}
              >
                <MessageCircle size={16} />
                댓글 {showComments ? '닫기' : '열기'}
              </button>
            )}
            
            <a
              href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${document.fileUrl}`}
              download={document.fileName}
              className="btn btn-secondary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={16} />
              다운로드
            </a>
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
      <div className="flex-1 flex min-h-0">
        {/* 문서 뷰어 */}
        <div className={`${showComments && canComment ? 'flex-1' : 'w-full'} bg-gray-100`}>
          <DocViewer
            document={document}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        {/* 댓글 사이드바 */}
        {showComments && canComment && (
          <div className="w-96 bg-white border-l">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">페이지 {currentPage} 댓글</h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <CommentsTab
                  document={document}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 권한 알림 */}
      {document.permission === 'view' && (
        <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-2">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <AlertCircle size={16} />
            <span>이 문서는 읽기 전용입니다. 댓글을 작성할 수 없습니다.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareView;