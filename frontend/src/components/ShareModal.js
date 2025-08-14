import React, { useState, useEffect } from 'react';
import { shareAPI } from '../utils/api';
import { X, Copy, Eye, MessageCircle, Lock, Calendar, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareModal = ({ document, onClose, onUpdate }) => {
  const [shareSettings, setShareSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    permission: 'view',
    password: '',
    expireAt: '',
    isActive: true
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadShareSettings();
  }, [document.id]);

  const loadShareSettings = async () => {
    try {
      setLoading(true);
      const response = await shareAPI.getSettings(document.id);
      
      if (response.success && response.data) {
        setShareSettings(response.data);
        setFormData({
          permission: response.data.permission,
          password: '',
          expireAt: response.data.expireAt || '',
          isActive: true
        });
      } else {
        setShareSettings(null);
      }
    } catch (error) {
      console.error('공유 설정 로드 오류:', error);
      setShareSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateShare = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        permission: formData.permission,
        expireAt: formData.expireAt || null
      };

      if (formData.password.trim()) {
        data.password = formData.password.trim();
      }

      const response = await shareAPI.create(document.id, data);

      if (response.success) {
        toast.success('공유 설정이 저장되었습니다.');
        loadShareSettings();
        if (onUpdate) onUpdate();
        
        // 새로 생성된 링크 자동 복사
        if (response.data.shareUrl) {
          await copyToClipboard(response.data.shareUrl);
        }
      } else {
        toast.error('공유 설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('공유 설정 저장 오류:', error);
      toast.error('공유 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisableShare = async () => {
    if (!window.confirm('공유 링크를 비활성화하시겠습니까?')) {
      return;
    }

    try {
      const response = await shareAPI.disable(document.id);

      if (response.success) {
        toast.success('공유 링크가 비활성화되었습니다.');
        setShareSettings(null);
        if (onUpdate) onUpdate();
      } else {
        toast.error('공유 링크 비활성화에 실패했습니다.');
      }
    } catch (error) {
      console.error('공유 링크 비활성화 오류:', error);
      toast.error('공유 링크 비활성화 중 오류가 발생했습니다.');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('링크가 클립보드에 복사되었습니다.');
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // 최소 30분 후
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">공유 설정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
              <span className="ml-2">로딩 중...</span>
            </div>
          ) : (
            <>
              {/* 현재 공유 상태 */}
              {shareSettings ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">공유 활성화됨</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Lock size={14} />
                      <span>권한: {shareSettings.permission === 'view' ? '읽기 전용' : '댓글 작성 가능'}</span>
                    </div>
                    
                    {shareSettings.hasPassword && (
                      <div className="flex items-center gap-2">
                        <Lock size={14} />
                        <span>비밀번호 보호됨</span>
                      </div>
                    )}
                    
                    {shareSettings.expireAt && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>만료: {new Date(shareSettings.expireAt).toLocaleString('ko-KR')}</span>
                      </div>
                    )}
                  </div>

                  {/* 공유 링크 */}
                  <div className="mt-3 p-2 bg-white border rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareSettings.shareUrl}
                        readOnly
                        className="flex-1 text-sm border-none bg-transparent"
                      />
                      <button
                        onClick={() => copyToClipboard(shareSettings.shareUrl)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 비활성화 버튼 */}
                  <button
                    onClick={handleDisableShare}
                    className="btn btn-danger btn-sm w-full mt-3"
                  >
                    공유 링크 비활성화
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-gray-600">활성화된 공유 링크가 없습니다.</p>
                </div>
              )}

              {/* 공유 설정 폼 */}
              <form onSubmit={handleCreateOrUpdateShare} className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">
                    {shareSettings ? '공유 설정 변경' : '새 공유 링크 생성'}
                  </h3>

                  {/* 권한 설정 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">접근 권한</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="permission"
                          value="view"
                          checked={formData.permission === 'view'}
                          onChange={(e) => setFormData(prev => ({ ...prev, permission: e.target.value }))}
                        />
                        <Eye size={16} />
                        <span className="text-sm">읽기 전용 (문서 열람만 가능)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="permission"
                          value="comment"
                          checked={formData.permission === 'comment'}
                          onChange={(e) => setFormData(prev => ({ ...prev, permission: e.target.value }))}
                        />
                        <MessageCircle size={16} />
                        <span className="text-sm">댓글 작성 가능 (읽기 + 댓글)</span>
                      </label>
                    </div>
                  </div>

                  {/* 비밀번호 설정 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      비밀번호 (선택사항)
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="비밀번호를 설정하지 않으면 누구나 접근 가능"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <label className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                      />
                      <span className="text-xs text-gray-600">비밀번호 표시</span>
                    </label>
                  </div>

                  {/* 만료일 설정 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      만료일 (선택사항)
                    </label>
                    <input
                      type="datetime-local"
                      className="input"
                      min={getMinDateTime()}
                      value={formData.expireAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expireAt: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      설정하지 않으면 영구적으로 유효합니다
                    </p>
                  </div>

                  {/* 버튼 */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary w-full"
                  >
                    {saving ? (
                      <>
                        <div className="spinner"></div>
                        저장 중...
                      </>
                    ) : (
                      shareSettings ? '설정 변경' : '공유 링크 생성'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;