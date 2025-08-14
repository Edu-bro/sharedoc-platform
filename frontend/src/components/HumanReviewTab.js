import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../utils/api';
import { 
  Plus, 
  Users, 
  Clock, 
  CheckCircle, 
  Mail, 
  Calendar,
  BarChart3,
  MessageSquare,
  Copy,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const HumanReviewTab = ({ document, isOwner }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    purpose: 'ir',
    items: [
      { id: 'market', label: '시장성', required: true },
      { id: 'story', label: '스토리', required: true },
      { id: 'design', label: '디자인', required: false },
      { id: 'finance', label: '재무', required: false }
    ],
    overallRequired: true,
    dueAt: '',
    invitees: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOwner) {
      loadRequests();
    }
  }, [document.id, isOwner]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getRequests(document.id);
      
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('리뷰 요청 목록 로드 오류:', error);
      toast.error('리뷰 요청 목록 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    
    const inviteEmails = formData.invitees
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (inviteEmails.length === 0) {
      toast.error('초대할 리뷰어의 이메일을 입력해주세요.');
      return;
    }

    const selectedItems = formData.items.filter(item => item.required);
    if (selectedItems.length === 0) {
      toast.error('최소 하나의 평가 항목을 선택해주세요.');
      return;
    }

    setCreating(true);

    try {
      const requestData = {
        purpose: formData.purpose,
        items: selectedItems,
        overallRequired: formData.overallRequired,
        dueAt: formData.dueAt || null,
        invitees: inviteEmails
      };

      const response = await reviewAPI.createRequest(document.id, requestData);

      if (response.success) {
        toast.success('리뷰 요청이 생성되었습니다!');
        setShowCreateForm(false);
        loadRequests();
        
        // 초대 링크 클립보드 복사
        if (response.data.inviteLink) {
          await navigator.clipboard.writeText(response.data.inviteLink);
          toast.success('초대 링크가 클립보드에 복사되었습니다.');
        }
      } else {
        toast.error(response.error || '리뷰 요청 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 요청 생성 오류:', error);
      toast.error('리뷰 요청 생성 중 오류가 발생했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const copyInviteLink = async (requestId) => {
    const inviteLink = `${window.location.origin}/review/${requestId}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('초대 링크가 복사되었습니다.');
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, dueAt) => {
    const now = new Date();
    const due = dueAt ? new Date(dueAt) : null;
    
    if (status === 'completed') {
      return <span className="badge badge-success">완료</span>;
    }
    
    if (due && due < now) {
      return <span className="badge badge-danger">마감</span>;
    }
    
    return <span className="badge badge-warning">진행중</span>;
  };

  if (!isOwner) {
    return (
      <div className="p-4 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600">문서 소유자만 리뷰 요청을 관리할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">사람 평가 요청</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            새 요청
          </button>
        </div>

        {/* 요청 생성 폼 */}
        {showCreateForm && (
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">리뷰 요청 생성</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateRequest} className="space-y-4">
                {/* 목적 선택 */}
                <div>
                  <label className="block text-sm font-medium mb-1">문서 목적</label>
                  <select
                    className="input select"
                    value={formData.purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  >
                    <option value="ir">IR 자료</option>
                    <option value="proposal">제안서</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                {/* 평가 항목 */}
                <div>
                  <label className="block text-sm font-medium mb-2">평가 항목</label>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <label key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].required = e.target.checked;
                            setFormData(prev => ({ ...prev, items: newItems }));
                          }}
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 종합 코멘트 필수 여부 */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.overallRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, overallRequired: e.target.checked }))}
                    />
                    <span className="text-sm">종합 코멘트 필수</span>
                  </label>
                </div>

                {/* 마감일 */}
                <div>
                  <label className="block text-sm font-medium mb-1">마감일 (선택사항)</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.dueAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueAt: e.target.value }))}
                  />
                </div>

                {/* 초대 이메일 */}
                <div>
                  <label className="block text-sm font-medium mb-1">초대할 리뷰어 이메일</label>
                  <textarea
                    className="input textarea"
                    placeholder="이메일을 쉼표로 구분하여 입력하세요&#10;예: reviewer1@example.com, reviewer2@example.com"
                    value={formData.invitees}
                    onChange={(e) => setFormData(prev => ({ ...prev, invitees: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-secondary flex-1"
                    disabled={creating}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <div className="spinner"></div>
                        생성 중...
                      </>
                    ) : (
                      '요청 생성'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 요청 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
            <span className="ml-2">로딩 중...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">리뷰 요청이 없습니다</h3>
            <p className="text-gray-600 text-sm mb-4">
              전문가에게 리뷰를 요청해보세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {request.purpose === 'ir' ? 'IR 자료' : 
                           request.purpose === 'proposal' ? '제안서' : '기타'} 리뷰
                        </span>
                        {getStatusBadge(request.status, request.due_at)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(request.created_at)}
                        </div>
                        {request.due_at && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            마감: {formatDate(request.due_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyInviteLink(request.id)}
                        className="btn btn-secondary btn-sm"
                        title="초대 링크 복사"
                      >
                        <Copy size={14} />
                      </button>
                      <a
                        href={`/review/${request.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        title="리뷰 페이지 열기"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  {/* 평가 항목 */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">평가 항목:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.items.map((item) => (
                        <span key={item.id} className="badge badge-secondary text-xs">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 초대된 리뷰어 */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">초대된 리뷰어:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.invitees.map((email, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 응답 현황 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BarChart3 size={14} className="text-gray-500" />
                        <span className="text-gray-600">
                          응답 {request.response_count}/{request.invitees.length}
                        </span>
                      </div>
                      {request.overall_required && (
                        <div className="flex items-center gap-1">
                          <MessageSquare size={14} className="text-gray-500" />
                          <span className="text-gray-600">종합 코멘트 필수</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HumanReviewTab;