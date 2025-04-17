
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGamesByLeague } from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { GameCard } from '@/components/sportsbook/GameCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeagueGamesProps {
  leagueId: string;
}

export const LeagueGames: React.FC<LeagueGamesProps> = ({ leagueId }) => {
  console.log('LeagueGames component rendering for leagueId:', leagueId);
  
  const { data: games, isLoading, error, refetch } = useQuery({
    queryKey: ['games', leagueId],
    queryFn: () => fetchGamesByLeague(leagueId),
    // Add retry and staleTime settings
    retry: 1,
    staleTime: 60000,
  });

  console.log('Games data:', games);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-md">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading games:', error);
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error loading games</AlertTitle>
        <AlertDescription>
          <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No upcoming games for this league</p>
        <p className="text-xs mt-2 text-muted-foreground">
          League ID: {leagueId}
        </p>
      </div>
    );
  }

  // Group games by date
  const gamesByDate = games.reduce((acc, game) => {
    const date = new Date(game.startTime).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(game);
    return acc;
  }, {} as Record<string, typeof games>);

  // Sort dates chronologically
  const sortedDates = Object.keys(gamesByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-4">
          <div className="sticky top-0 bg-background pt-2 pb-1 z-10">
            <h3 className="text-sm font-medium text-muted-foreground">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <Separator className="mt-1" />
          </div>
          
          <div className="space-y-4">
            {gamesByDate[date].map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
