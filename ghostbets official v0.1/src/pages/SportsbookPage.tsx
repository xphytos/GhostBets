
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MainLayout } from '@/components/layout/MainLayout';
import { BetSlipDrawer } from '@/components/sportsbook/BetSlipDrawer';
import { useBetting } from '@/context/BettingContext';
import { SportType } from '@/types/betting';
import { fetchAllLeagues } from '@/lib/api';
import { LeagueGames } from '@/components/sportsbook/LeagueGames';
import { useQuery } from '@tanstack/react-query';
import { SportsNavigation, sportEmojis, sportLabels } from '@/components/sportsbook/SportsNavigation';
import { FeaturedEvents } from '@/components/sportsbook/FeaturedEvents';
import { EnhancedBettingProvider } from '@/context/EnhancedBettingContext';
import { supportedSports } from '@/lib/espn-api/client';
import HorizontalAdBanner from '@/components/ads/HorizontalAdBanner';

const SportsbookContent = () => {
  // Get initially supported sport
  const getInitialSport = (): SportType => {
    // Find first sport that is supported and has leagues
    for (const sportType of Object.keys(supportedSports) as SportType[]) {
      const sportConfig = supportedSports[sportType];
      if (sportConfig.id && Object.keys(sportConfig.leagues).length > 0) {
        return sportType;
      }
    }
    return 'football'; // Default fallback
  };

  const [currentSport, setCurrentSport] = useState<SportType>(getInitialSport());
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { betSlip } = useBetting();
  
  const { data: allLeagues = [], isLoading: isLoadingLeagues } = useQuery({
    queryKey: ['all-leagues'],
    queryFn: fetchAllLeagues,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Filter leagues by the current sport
  const sportLeagues = allLeagues ? allLeagues.filter(league => league.sportType === currentSport) : [];
  
  useEffect(() => {
    if (sportLeagues.length > 0 && !selectedLeague) {
      setSelectedLeague(sportLeagues[0].id);
    } else if (sportLeagues.length > 0 && !sportLeagues.some(league => league.id === selectedLeague)) {
      setSelectedLeague(sportLeagues[0].id);
    }
  }, [currentSport, sportLeagues, selectedLeague]);

  const handleSportChange = (sport: SportType) => {
    setCurrentSport(sport);
    setSelectedLeague(null);
  };

  const currentLeagueName = selectedLeague && allLeagues 
    ? allLeagues.find(league => league.id === selectedLeague)?.name 
    : '';

  // Get today's date for display
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex flex-col space-y-4">
          {/* Header section */}
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
            {selectedLeague && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/sportsbook?league=${selectedLeague}`}>
                    {currentLeagueName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </Breadcrumb>
          
          {/* Sports navigation */}
          <SportsNavigation currentSport={currentSport} onSportChange={handleSportChange} />
          
          {/* League selection (if any leagues are available) */}
          {sportLeagues.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {sportLeagues.map(league => (
                <Button
                  key={league.id}
                  variant={selectedLeague === league.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLeague(league.id)}
                  className="mb-1"
                >
                  {league.name}
                </Button>
              ))}
            </div>
          )}
          
          {/* Ad placement before main content */}
          <HorizontalAdBanner slot="2468013579" />
          
          {/* Main content area */}
          <div className="w-full">
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  {currentLeagueName ? currentLeagueName : `${sportLabels[currentSport]} Games`}
                </CardTitle>
                <CardDescription>
                  Available matches and betting lines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeagues ? (
                  <div className="text-center p-6 text-muted-foreground">
                    Loading leagues...
                  </div>
                ) : selectedLeague ? (
                  <LeagueGames leagueId={selectedLeague} />
                ) : sportLeagues.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    No leagues available for {sportLabels[currentSport]}
                  </div>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    Please select a league from above
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Featured Events section */}
          <div className="w-full mt-6">
            <FeaturedEvents />
          </div>
        </div>
      </div>
      
      {/* Bet Slip Drawer */}
      <BetSlipDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </MainLayout>
  );
};

const SportsbookPage = () => {
  return (
    <EnhancedBettingProvider>
      <SportsbookContent />
    </EnhancedBettingProvider>
  );
};

export default SportsbookPage;
