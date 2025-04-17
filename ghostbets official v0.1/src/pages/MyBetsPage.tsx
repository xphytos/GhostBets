
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActiveBetsTable } from '@/components/sportsbook/ActiveBetsTable';
import { useEnhancedBetting } from '@/context/EnhancedBettingContext';
import { Trophy, History, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MyBetsPage = () => {
  const { activeBets, settledBets, fetchUserBetsOnly, isRefreshing } = useEnhancedBetting();
  const { user } = useAuth();
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Only fetch user bets when page loads (not leagues or games)
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
      <Card className="border shadow min-h-[60vh]">
        <CardHeader>
          <CardTitle>My Bets</CardTitle>
          <CardDescription>
            View and manage your active bets and betting history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to view your bets
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Bets</h2>
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
              </div>

              <Tabs defaultValue="active" className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="active" className="flex-1">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} /> Active Bets ({activeBets.length})
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    <div className="flex items-center gap-2">
                      <History size={16} /> Bet History ({settledBets.length})
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  <ActiveBetsTable bets={activeBets} isLoading={isRefreshing && !isInitialLoadComplete} />
                </TabsContent>
                
                <TabsContent value="history">
                  <ActiveBetsTable bets={settledBets} isLoading={isRefreshing && !isInitialLoadComplete} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default MyBetsPage;
