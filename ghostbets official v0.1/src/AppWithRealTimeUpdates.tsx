
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import EnhancedSportsbookPage from '@/pages/EnhancedSportsbookPage';
import { Toaster } from '@/components/ui/sonner';
import { EnhancedBettingProvider } from '@/context/EnhancedBettingContext';
import RewardsPage from './pages/RewardsPage';
import MyBetsPage from './pages/MyBetsPage';
import ComingSoonPage from './pages/ComingSoonPage';
import LandingPage from './pages/LandingPage';
import HowToBetPage from './pages/HowToBetPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { ThemeProvider } from './hooks/use-theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to login from protected route');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) return null; // Don't render children while redirecting
  
  return children;
};

function AppContent() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/how-to-bet" element={<HowToBetPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/sportsbook" element={
        <ProtectedRoute>
          <EnhancedSportsbookPage />
        </ProtectedRoute>
      } />
      <Route path="/rewards" element={
        <ProtectedRoute>
          <RewardsPage />
        </ProtectedRoute>
      } />
      <Route path="/my-bets" element={
        <ProtectedRoute>
          <MyBetsPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/coming-soon" element={
        <ProtectedRoute>
          <ComingSoonPage title="Coming Soon" />
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AppWithRealTimeUpdates() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <EnhancedBettingProvider>
            <AppContent />
            <Toaster position="top-right" />
          </EnhancedBettingProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppWithRealTimeUpdates;
