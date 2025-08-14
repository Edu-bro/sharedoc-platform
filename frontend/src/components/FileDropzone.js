import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

const FileDropzone = ({ onFileSelect, selectedFile, onFileRemove, disabled }) => {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    }
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return <File className="h-6 w-6 text-blue-600" />;
  };

  if (selectedFile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              {getFileIcon(selectedFile.name)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            {!disabled && (
              <button
                type="button"
                onClick={onFileRemove}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 선택'}
        </p>
        <p className="text-sm text-gray-500">
          PDF, PPT, DOC 파일 • 최대 50MB
        </p>
      </div>

      {fileRejections.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="text-sm text-red-700">
              {fileRejections.map(({ file, errors }) => (
                <div key={file.path}>
                  <p className="font-medium">{file.name}</p>
                  <ul className="list-disc list-inside mt-1">
                    {errors.map(error => (
                      <li key={error.code}>
                        {error.code === 'file-too-large' 
                          ? '파일 크기가 50MB를 초과합니다.'
                          : error.code === 'file-invalid-type'
                          ? '지원하지 않는 파일 형식입니다.'
                          : error.message
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;