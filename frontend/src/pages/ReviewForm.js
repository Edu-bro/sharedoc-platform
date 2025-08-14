import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  User, 
  Calendar, 
  Star, 
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewForm = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    scores: {},
    comments: {},
    overall: '',
    reviewerName: ''
  });

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getRequestForm(requestId);
      
      if (response.success) {
        setRequest(response.data);
        
        // 기존 응답이 있으면 폼에 채우기
        if (response.data.existingReview) {
          const existing = response.data.existingReview;
          const scores = {};
          const comments = {};
          
          existing.scores.forEach(score => {
            scores[score.itemId] = score.score;
          });
          
          existing.comments.forEach(comment => {
            comments[comment.itemId] = comment.body;
          });
          
          setFormData({
            scores,
            comments,
            overall: existing.overall || '',
            reviewerName: ''
          });
        } else {
          // 새 응답인 경우 점수 초기화
          const initialScores = {};
          response.data.items.forEach(item => {
            initialScores[item.id] = 3; // 기본값 3점
          });
          
          setFormData(prev => ({
            ...prev,
            scores: initialScores
          }));
        }
      } else {
        toast.error('리뷰 요청을 찾을 수 없습니다.');
        navigate('/');
      }
    } catch (error) {
      console.error('리뷰 요청 로드 오류:', error);
      toast.error('리뷰 요청 로드 중 오류가 발생했습니다.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (itemId, score) => {
    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: score
      }
    }));
  };

  const handleCommentChange = (itemId, comment) => {
    setFormData(prev => ({
      ...prev,
      comments: {
        ...prev.comments,
        [itemId]: comment
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 종합 코멘트 필수 확인
    if (request.overallRequired && !formData.overall.trim()) {
      toast.error('종합 코멘트는 필수입니다.');
      return;
    }

    // 익명 사용자 이름 확인
    if (!user && !formData.reviewerName.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const scores = Object.entries(formData.scores).map(([itemId, score]) => ({
        itemId,
        score: Number(score)
      }));

      const comments = Object.entries(formData.comments)
        .filter(([_, body]) => body.trim().length > 0)
        .map(([itemId, body]) => ({
          itemId,
          body: body.trim()
        }));

      const submitData = {
        scores,
        comments,
        overall: formData.overall.trim() || null
      };

      if (!user) {
        submitData.reviewerName = formData.reviewerName.trim();
      }

      const response = await reviewAPI.submitReview(requestId, submitData);

      if (response.success) {
        toast.success('리뷰가 성공적으로 제출되었습니다!');
        loadRequest(); // 제출 후 새로고침하여 완료 상태 표시
      } else {
        toast.error('리뷰 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 제출 오류:', error);
      toast.error('리뷰 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreLabel = (score) => {
    const labels = {
      1: '매우 부족',
      2: '부족',
      3: '보통',
      4: '좋음',
      5: '매우 좋음'
    };
    return labels[score] || '보통';
  };

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
        <span className="ml-2">로딩 중...</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">요청을 찾을 수 없습니다</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = !!request.existingReview;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary btn-sm mb-4"
          >
            <ArrowLeft size={16} />
            홈으로
          </button>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {request.docTitle}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      요청자: {request.requesterName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      목적: {request.purpose === 'ir' ? 'IR 자료' : 
                             request.purpose === 'proposal' ? '제안서' : '기타'}
                    </div>
                    {request.dueAt && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        마감: {formatDate(request.dueAt)}
                      </div>
                    )}
                  </div>

                  {isCompleted && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">
                        리뷰 완료 ({formatDate(request.existingReview.submittedAt)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 문서 미리보기 */}
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold">문서 미리보기</h2>
          </div>
          <div className="card-body">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">문서를 미리 확인하세요</p>
              <a
                href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${request.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                문서 열기
              </a>
            </div>
          </div>
        </div>

        {/* 리뷰 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 익명 사용자 이름 입력 */}
          {!user && (
            <div className="card">
              <div className="card-body">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  리뷰어 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="이름을 입력하세요"
                  value={formData.reviewerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                  required={!user}
                  disabled={isCompleted}
                />
              </div>
            </div>
          )}

          {/* 평가 항목들 */}
          <div className="space-y-4">
            {request.items.map((item) => (
              <div key={item.id} className="card">
                <div className="card-header">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    {item.label}
                    {item.required && <span className="text-red-500">*</span>}
                  </h3>
                </div>
                <div className="card-body space-y-4">
                  {/* 점수 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      점수 (1-5점)
                    </label>
                    <div className="flex items-center gap-4">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <label key={score} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`score-${item.id}`}
                            value={score}
                            checked={formData.scores[item.id] === score}
                            onChange={() => handleScoreChange(item.id, score)}
                            disabled={isCompleted}
                          />
                          <span className={`text-sm ${getScoreColor(score)}`}>
                            {score}점
                          </span>
                        </label>
                      ))}
                    </div>
                    {formData.scores[item.id] && (
                      <p className={`text-sm mt-1 ${getScoreColor(formData.scores[item.id])}`}>
                        {getScoreLabel(formData.scores[item.id])}
                      </p>
                    )}
                  </div>

                  {/* 코멘트 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      세부 코멘트 (선택사항)
                    </label>
                    <textarea
                      className="input textarea"
                      placeholder={`${item.label}에 대한 구체적인 피드백을 작성해주세요`}
                      value={formData.comments[item.id] || ''}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      rows={3}
                      disabled={isCompleted}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 종합 코멘트 */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                종합 코멘트
                {request.overallRequired && <span className="text-red-500">*</span>}
              </h3>
            </div>
            <div className="card-body">
              <textarea
                className="input textarea"
                placeholder="전체적인 평가와 개선사항을 종합적으로 작성해주세요"
                value={formData.overall}
                onChange={(e) => setFormData(prev => ({ ...prev, overall: e.target.value }))}
                rows={5}
                required={request.overallRequired}
                disabled={isCompleted}
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          {!isCompleted && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    리뷰 제출
                  </>
                )}
              </button>
            </div>
          )}

          {/* 완료 메시지 */}
          {isCompleted && (
            <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                리뷰가 완료되었습니다
              </h3>
              <p className="text-green-700">
                소중한 피드백을 제공해주셔서 감사합니다!
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;