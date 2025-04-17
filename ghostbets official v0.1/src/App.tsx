import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RewardsPage from "./pages/RewardsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import SportsbookPage from "./pages/SportsbookPage";
import MyBetsPage from "./pages/MyBetsPage";
import LandingPage from "./pages/LandingPage";
import HowToBetPage from "./pages/HowToBetPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { BettingProvider } from "./context/BettingContext";
import { EnhancedBettingProvider } from "./context/EnhancedBettingContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/landing" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <BettingProvider>
            <EnhancedBettingProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/how-to-bet" element={<HowToBetPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/rewards" element={
                    <ProtectedRoute>
                      <RewardsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sportsbook" element={
                    <ProtectedRoute>
                      <SportsbookPage />
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
                  
                  {/* Placeholder routes */}
                  <Route path="/leagues" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Leagues" />
                    </ProtectedRoute>
                  } />
                  <Route path="/pick6" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Pick 6" />
                    </ProtectedRoute>
                  } />
                  <Route path="/events" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Events" />
                    </ProtectedRoute>
                  } />
                  <Route path="/live" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Live In-Game" />
                    </ProtectedRoute>
                  } />
                  <Route path="/vip" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="VIP" />
                    </ProtectedRoute>
                  } />
                  <Route path="/casino" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Casino" />
                    </ProtectedRoute>
                  } />
                  <Route path="/social" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Social" />
                    </ProtectedRoute>
                  } />
                  <Route path="/shop" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Shop" />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <ComingSoonPage title="Settings" />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </EnhancedBettingProvider>
          </BettingProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
