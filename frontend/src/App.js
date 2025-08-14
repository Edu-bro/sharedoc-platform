import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import DocumentView from './pages/DocumentView';
import ReviewForm from './pages/ReviewForm';
import ShareView from './pages/ShareView';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 인증이 필요 없는 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/share/:linkId" element={<ShareView />} />
        <Route path="/review/:requestId" element={<ReviewForm />} />
        
        {/* 인증이 필요한 페이지 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="doc/:id" element={<DocumentView />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;