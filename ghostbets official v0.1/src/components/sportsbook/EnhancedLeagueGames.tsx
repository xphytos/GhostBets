
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGamesBySport } from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { GameCard } from '@/components/sportsbook/GameCard';
import { LiveGameCard } from '@/components/sportsbook/LiveGameCard';
import { Skeleton } from '@/components/ui/skeleton';
import { liveUpdateService } from '@/services/liveUpdateService';
import { SportType } from '@/types/betting';

interface EnhancedLeagueGamesProps {
  sportType: SportType;
}

export const EnhancedLeagueGames: React.FC<EnhancedLeagueGamesProps> = ({ sportType }) => {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games', sportType],
    queryFn: () => fetchGamesBySport(sportType),
  });

  // Start live updates service when component mounts
  React.useEffect(() => {
    liveUpdateService.startUpdates();
    
    // Clean up when component unmounts
    return () => {
      // We don't stop the service here as other components might be using it
    };
  }, []);

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
    return (
      <div className="p-6 text-center text-destructive">
        <p>Error loading games. Please try again.</p>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No upcoming games for this sport</p>
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

  return (
    <div className="space-y-6">
      {Object.entries(gamesByDate).map(([date, dateGames]) => (
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
            {dateGames.map((game) => (
              game.status === 'live' ? (
                <LiveGameCard key={game.id} gameId={game.id} />
              ) : (
                <GameCard key={game.id} game={game} />
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
