import React, { useState, useEffect } from 'react';
import { commentAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  Send, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const CommentsTab = ({ document, currentPage }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    loadComments();
  }, [document.id, currentPage]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getByDoc(document.id, currentPage);
      
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('코멘트 로드 오류:', error);
      toast.error('코멘트 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('코멘트를 입력해주세요.');
      return;
    }

    if (!user && !authorName.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        page: currentPage,
        body: newComment.trim()
      };

      if (!user) {
        data.authorName = authorName.trim();
      }

      const response = await commentAPI.create(document.id, data);

      if (response.success) {
        setNewComment('');
        setAuthorName('');
        loadComments();
        toast.success('코멘트가 작성되었습니다.');
      } else {
        toast.error('코멘트 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('코멘트 작성 오류:', error);
      toast.error('코멘트 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error('코멘트를 입력해주세요.');
      return;
    }

    try {
      const response = await commentAPI.update(document.id, commentId, {
        body: editText.trim()
      });

      if (response.success) {
        setEditingId(null);
        setEditText('');
        loadComments();
        toast.success('코멘트가 수정되었습니다.');
      } else {
        toast.error('코멘트 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('코멘트 수정 오류:', error);
      toast.error('코멘트 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('이 코멘트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await commentAPI.delete(document.id, commentId);

      if (response.success) {
        loadComments();
        toast.success('코멘트가 삭제되었습니다.');
      } else {
        toast.error('코멘트 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('코멘트 삭제 오류:', error);
      toast.error('코멘트 삭제 중 오류가 발생했습니다.');
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditOrDelete = (comment) => {
    return user && comment.author_id === user.id;
  };

  const isOwner = user && document.owner_id === user.id;

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">페이지 {currentPage} 코멘트</h3>
          <span className="text-sm text-gray-500">
            {comments.length}개
          </span>
        </div>
      </div>

      {/* 코멘트 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
            <span className="ml-2">로딩 중...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">이 페이지에 코멘트가 없습니다.</p>
            <p className="text-sm text-gray-500">첫 번째 코멘트를 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg border p-3">
                {/* 코멘트 헤더 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <User size={14} className="text-gray-600" />
                    </div>
                    <span className="font-medium text-sm">
                      {comment.author_display_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  {/* 액션 버튼 */}
                  {(canEditOrDelete(comment) || isOwner) && (
                    <div className="flex gap-1">
                      {canEditOrDelete(comment) && (
                        <button
                          onClick={() => startEdit(comment)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="수정"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {(canEditOrDelete(comment) || isOwner) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 코멘트 내용 */}
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="input textarea w-full"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <Check size={14} />
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn btn-secondary btn-sm"
                      >
                        <X size={14} />
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 코멘트 작성 폼 */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmitComment} className="space-y-3">
          {/* 익명 사용자용 이름 입력 */}
          {!user && (
            <input
              type="text"
              className="input"
              placeholder="이름을 입력하세요"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
          )}

          {/* 코멘트 입력 */}
          <div className="flex gap-2">
            <textarea
              className="input textarea flex-1"
              placeholder="이 페이지에 대한 코멘트를 작성하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* 전송 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim() || (!user && !authorName.trim())}
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <div className="spinner"></div>
                  전송 중...
                </>
              ) : (
                <>
                  <Send size={16} />
                  코멘트 작성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsTab;