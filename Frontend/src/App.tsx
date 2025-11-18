import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import PublishPage from './components/PublishPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import CommentSection from './pages/CommentSection';
import PaperDetailsPage from './pages/PaperDetailsPage';
import MyPublicationsPage from './pages/MyPublicationsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanel from './components/admin/AdminPanel';
import './App.css';
import PDFSummarizer from './components/PDFSummarizer';

// Dashboard component that requires authentication
const Dashboard: React.FC = () => {
  return (
    <div className="app-body">
      <Sidebar />
      <MainContent />
    </div>
  );
};

// Main App component with routing
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div>Loading ResearchHub...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Show header only when authenticated to avoid duplicate nav on login pages */}
      {isAuthenticated && <Header />}
      
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />
          } 
        />
        
        <Route 
          path="/admin/signup" 
          element={
            <Navigate to="/admin/login" replace />
          } 
        />
        
        <Route 
          path="/admin/login" 
          element={
            !isAuthenticated ? <AdminLoginPage /> : <Navigate to="/admin" replace />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile/:userId" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
              </ProtectedRoute>
          }
          />
        <Route
          path="/summary" 
          element={
            <ProtectedRoute>
              <PDFSummarizer />
            </ProtectedRoute>
          }
           
        />
        
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/papers/:paperId/comments" 
          element={
            <ProtectedRoute>
              <CommentSection />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/papers/:id" 
          element={
            <ProtectedRoute>
              <PaperDetailsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 

          path="/my-publications" 
          element={
            <ProtectedRoute>
              <MyPublicationsPage />
            </ProtectedRoute>
          } />


          <Route 
          path="/publish" 
          element={
            <ProtectedRoute>
              <PublishPage />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};


// Main App wrapper with AuthProvider (no Router here)
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
