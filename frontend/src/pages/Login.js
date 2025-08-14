import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email.trim(), name.trim());
      
      if (result.success) {
        toast.success('로그인 성공!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
              <FileText size={32} />
              문서 리뷰 플랫폼
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            이메일로 간편하게 시작하세요
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 주소
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input pl-10"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름 (선택사항)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input pl-10"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  입력하지 않으면 이메일 주소로 표시됩니다
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            이 플랫폼은 IR 자료 및 제안서 리뷰를 위한 POC입니다.
            <br />
            계정이 없다면 자동으로 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;