
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActiveBetsTable } from '@/components/sportsbook/ActiveBetsTable';
import { useEnhancedBetting } from '@/context/EnhancedBettingContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Simplified version of the enhanced my bets page
const EnhancedMyBetsPage = () => {
  const { user } = useAuth();
  const { activeBets, fetchUserBetsOnly, isRefreshing } = useEnhancedBetting();
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  
  // Only fetch user bets data when component mounts and user is logged in
  useEffect(() => {
    if (user && !isInitialLoadComplete) {
      fetchUserBetsOnly().then(() => {
        setIsInitialLoadComplete(true);
      });
    }
  }, [user, fetchUserBetsOnly, isInitialLoadComplete]);
  
  const handleRefresh = () => {
    fetchUserBetsOnly();
    toast.info("Refreshing your bets...");
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Bets</h1>
        
        {!user ? (
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to view your betting dashboard
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="border shadow min-h-[60vh]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Bets</CardTitle>
                <CardDescription>Your currently active bets</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <ActiveBetsTable bets={activeBets} isLoading={isRefreshing && !isInitialLoadComplete} />
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default EnhancedMyBetsPage;
