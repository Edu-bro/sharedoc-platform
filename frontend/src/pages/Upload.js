import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { documentAPI } from '../utils/api';
import { Upload as UploadIcon, File, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 50 * 1024 * 1024) {
          toast.error('파일 크기는 50MB 이하만 가능합니다.');
        } else {
          toast.error('지원하지 않는 파일 형식입니다. PDF, PPT, DOC 파일만 업로드 가능합니다.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        
        // 파일명에서 제목 자동 생성
        if (!title) {
          const fileName = selectedFile.name;
          const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
          setTitle(nameWithoutExt);
        }
      }
    }
  });

  const removeFile = () => {
    setFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    if (!title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      
      // 태그 처리
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      tagArray.forEach(tag => {
        formData.append('tags', tag);
      });

      const response = await documentAPI.upload(formData);

      if (response.success) {
        toast.success('문서가 성공적으로 업로드되었습니다!');
        navigate(`/doc/${response.data.docId}`);
      } else {
        toast.error(response.error || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      toast.error('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">문서 업로드</h1>
        <p className="text-gray-600 mt-1">
          IR 자료나 제안서를 업로드하여 AI 평가와 리뷰를 받아보세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 파일 업로드 영역 */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">파일 선택</h2>
          </div>
          <div className="card-body">
            {!file ? (
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 선택'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, PPT, DOC 파일 • 최대 50MB
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <File className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 문서 정보 */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">문서 정보</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                className="input"
                placeholder="문서 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                id="description"
                className="input textarea"
                placeholder="문서에 대한 간단한 설명을 입력하세요 (선택사항)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                태그
              </label>
              <input
                id="tags"
                type="text"
                className="input"
                placeholder="태그를 쉼표로 구분하여 입력하세요 (예: IR, 시리즈A, 핀테크)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                태그는 문서 검색과 분류에 도움이 됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 업로드 버튼 */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary flex-1"
            disabled={uploading}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={!file || !title.trim() || uploading}
          >
            {uploading ? (
              <>
                <div className="spinner"></div>
                업로드 중...
              </>
            ) : (
              <>
                <UploadIcon size={18} />
                문서 업로드
              </>
            )}
          </button>
        </div>
      </form>

      {/* 안내 정보 */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="card-body">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📋 업로드 후 가능한 기능
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• AI 자동 평가 (시장성, 스토리, 디자인, 재무)</li>
            <li>• 전문가 리뷰 요청 및 수집</li>
            <li>• 페이지별 코멘트 수집</li>
            <li>• 안전한 공유 링크 생성</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;