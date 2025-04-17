
import React, { useState, useEffect } from 'react';
import { CircleDot, Award, Building, Globe, Dumbbell, Flag, Shirt, Car, Activity, Volleyball } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MainLayout } from '@/components/layout/MainLayout';
import { BetSlipDrawer } from '@/components/sportsbook/BetSlipDrawer';
import { useBetting } from '@/context/BettingContext';
import { cn } from '@/lib/utils';
import { SportType } from '@/types/betting';
import { EnhancedLeagueGames } from '@/components/sportsbook/EnhancedLeagueGames';
import { LiveGamesSection } from '@/components/sportsbook/LiveGamesSection';
import { useQuery } from '@tanstack/react-query';
import { stopLiveUpdates } from '@/hooks/useLiveUpdates';
import { EnhancedBettingProvider } from '@/context/EnhancedBettingContext';

// Sport icons mapping
const sportIcons = {
  football: <Award size={20} />,
  basketball: <CircleDot size={20} />,
  baseball: <Award size={20} />,
  hockey: <Building size={20} />,
  soccer: <Globe size={20} />,
  mma: <Dumbbell size={20} />,
  rugby: <Flag size={20} />,
  volleyball: <Volleyball size={20} />,
  formula1: <Car size={20} />,
  afl: <Shirt size={20} />,
  handball: <Activity size={20} />
};

// Sport labels mapping
const sportLabels: Record<SportType, string> = {
  football: 'Football',
  basketball: 'Basketball',
  baseball: 'Baseball',
  hockey: 'Hockey',
  soccer: 'Soccer',
  mma: 'MMA',
  rugby: 'Rugby',
  volleyball: 'Volleyball',
  formula1: 'Formula 1',
  afl: 'AFL',
  handball: 'Handball'
};

// Sport emoji mapping for visual appeal
const sportEmojis: Record<SportType, string> = {
  football: '🏈',
  basketball: '🏀',
  baseball: '⚾',
  hockey: '🏒',
  soccer: '⚽',
  mma: '🥊',
  rugby: '🏉',
  volleyball: '🏐',
  formula1: '🏎️',
  afl: '🏉',
  handball: '🤾'
};

const EnhancedSportsbookContent = () => {
  const [currentSport, setCurrentSport] = useState<SportType>('football');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'live'>('games');
  const { betSlip } = useBetting();
  
  // Cleanup live updates when unmounting
  useEffect(() => {
    return () => {
      stopLiveUpdates();
    };
  }, []);

  // Get today's date for display
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  // Handle sport change
  const handleSportChange = (sport: SportType) => {
    setCurrentSport(sport);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex flex-col space-y-4">
          {/* Header with title, date, and bet slip button */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Sportsbook</h1>
              <p className="text-muted-foreground">{formattedDate}</p>
            </div>
            
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2"
              variant={betSlip.bets.length > 0 ? "default" : "outline"}
            >
              Bet Slip
              {betSlip.bets.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {betSlip.bets.length}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Breadcrumb navigation */}
          <Breadcrumb className="mb-4">
            <BreadcrumbItem>
              <BreadcrumbLink href="/sportsbook">Sportsbook</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/sportsbook?sport=${currentSport}`}>
                {sportEmojis[currentSport]} {sportLabels[currentSport]}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {activeTab === 'live' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/sportsbook?tab=live`}>
                    🔴 Live Games
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </Breadcrumb>
          
          {/* Sports navigation tabs */}
          <div className="overflow-x-auto pb-2">
            <Tabs value={currentSport} onValueChange={(value) => handleSportChange(value as SportType)}>
              <TabsList className="h-10 p-1 w-full sm:w-auto whitespace-nowrap">
                {(Object.keys(sportLabels) as SportType[]).map((sport) => (
                  <TabsTrigger
                    key={sport}
                    value={sport}
                    className={cn(
                      "h-8 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", 
                      { "bg-primary/5": currentSport === sport }
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block">{sportEmojis[sport]}</span>
                      {sportIcons[sport]}
                      <span>{sportLabels[sport]}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Tab selection for Games vs Live Games */}
          <div className="flex space-x-2 mb-2">
            <Button 
              variant={activeTab === 'games' ? "default" : "outline"} 
              onClick={() => setActiveTab('games')}
              className="flex items-center gap-2"
            >
              {sportEmojis[currentSport]} {sportLabels[currentSport]} Games
            </Button>
            <Button 
              variant={activeTab === 'live' ? "default" : "outline"} 
              onClick={() => setActiveTab('live')}
              className="flex items-center gap-2"
            >
              <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500 border-red-200">
                LIVE
              </Badge>
              Live Games
            </Button>
          </div>
          
          {/* Main content */}
          {activeTab === 'games' ? (
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  {sportEmojis[currentSport]} {sportLabels[currentSport]} Games
                </CardTitle>
                <CardDescription>
                  Available matches and betting lines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedLeagueGames sportType={currentSport} />
              </CardContent>
            </Card>
          ) : (
            // Show only live games when live tab is active
            <div className="w-full">
              <LiveGamesSection />
            </div>
          )}
        </div>
      </div>
      
      {/* Bet Slip Drawer */}
      <BetSlipDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </MainLayout>
  );
};

const EnhancedSportsbookPage = () => {
  return (
    <EnhancedBettingProvider>
      <EnhancedSportsbookContent />
    </EnhancedBettingProvider>
  );
};

export default EnhancedSportsbookPage;
