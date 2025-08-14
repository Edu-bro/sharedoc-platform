import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  Eye, 
  MessageCircle, 
  Calendar,
  User,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, sent, received

  useEffect(() => {
    loadDocuments();
  }, [filterType]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      
      if (filterType !== 'all') {
        params.type = filterType;
      }

      const response = await documentAPI.getList(params);
      
      if (response.success) {
        setDocuments(response.data);
      } else {
        toast.error('문서 목록 로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('문서 목록 로드 오류:', error);
      toast.error('문서 목록 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDocuments();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilterLabel = (type) => {
    switch (type) {
      case 'sent': return '내가 올린 문서';
      case 'received': return '받은 문서';
      default: return '전체 문서';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">안녕하세요, {user?.name}님! 📄</p>
        </div>
        
        <Link to="/upload" className="btn btn-primary">
          <Upload size={18} />
          새 문서 업로드
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="문서 제목, 설명, 태그로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="input select pl-10 pr-10"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">전체 문서</option>
                  <option value="sent">내가 올린 문서</option>
                  <option value="received">받은 문서</option>
                </select>
              </div>
              
              <button type="submit" className="btn btn-primary">
                검색
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 문서 목록 */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {getFilterLabel(filterType)} ({documents.length})
          </h2>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner"></div>
              <span className="ml-2">로딩 중...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">문서가 없습니다</h3>
              <p className="text-gray-500 mb-4">
                {filterType === 'all' 
                  ? '첫 번째 문서를 업로드해보세요!' 
                  : '해당 조건의 문서를 찾을 수 없습니다.'
                }
              </p>
              {filterType === 'all' && (
                <Link to="/upload" className="btn btn-primary">
                  <Upload size={18} />
                  문서 업로드
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/doc/${doc.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {doc.title}
                        </h3>
                        {doc.owner_id !== user?.id && (
                          <span className="badge badge-primary">받은 문서</span>
                        )}
                      </div>
                      
                      {doc.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          {doc.owner_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(doc.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          {doc.view_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          {doc.comment_count || 0}
                        </div>
                      </div>
                      
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag, index) => (
                            <span key={index} className="badge badge-secondary text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;