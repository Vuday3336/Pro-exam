import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExamProvider } from './contexts/ExamContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import QuickExamSetup from './pages/QuickExamSetup';
import ExamInterface from './pages/ExamInterface';
import ExamResults from './pages/ExamResults';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = "230627886142-059049imca6tcu80un1fbbu8e8ufekk5.apps.googleusercontent.com";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ExamProvider>
          <Router>
            <div className="App">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 2000,  // 2 seconds as requested
                  dismissible: true,
                  style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                  },
                  success: {
                    duration: 2000,  // 2 seconds for success messages
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    duration: 2000,  // 2 seconds for error messages
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/quick-exam" element={
                  <ProtectedRoute>
                    <QuickExamSetup />
                  </ProtectedRoute>
                } />
                <Route path="/exam/:examId" element={
                  <ProtectedRoute>
                    <ExamInterface />
                  </ProtectedRoute>
                } />
                <Route path="/results/:examId" element={
                  <ProtectedRoute>
                    <ExamResults />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </ExamProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;