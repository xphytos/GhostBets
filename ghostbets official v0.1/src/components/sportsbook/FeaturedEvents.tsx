
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchGamesBySport } from '@/lib/api';
import { Game } from '@/types/betting';

export const FeaturedEvents: React.FC = () => {
  // Fetch featured games from multiple sports
  const { data: footballGames = [], isLoading: isLoadingFootball } = useQuery({
    queryKey: ['games', 'football'],
    queryFn: () => fetchGamesBySport('football'),
  });
  
  const { data: basketballGames = [], isLoading: isLoadingBasketball } = useQuery({
    queryKey: ['games', 'basketball'],
    queryFn: () => fetchGamesBySport('basketball'),
  });
  
  const { data: soccerGames = [], isLoading: isLoadingSoccer } = useQuery({
    queryKey: ['games', 'soccer'],
    queryFn: () => fetchGamesBySport('soccer'),
  });
  
  const isLoading = isLoadingFootball || isLoadingBasketball || isLoadingSoccer;
  
  // Combine games from different sports and take top 5
  const allGames = [...footballGames, ...basketballGames, ...soccerGames];
  
  // Get the most relevant games (prioritize live and upcoming)
  const featuredGames = [...allGames]
    .sort((a, b) => {
      // Live games first
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      
      // Then sort by start time
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    })
    .slice(0, 5);

  // Helper function to get sport emoji
  const getSportEmoji = (game: Game): string => {
    const sportMap: Record<string, string> = {
      'football': '🏈',
      'basketball': '🏀',
      'baseball': '⚾',
      'hockey': '🏒',
      'soccer': '⚽',
      'mma': '🥊',
    };
    
    const sportType = game.leagueId.includes('nfl') || game.leagueId.includes('ncaaf') 
      ? 'football' 
      : game.leagueId.includes('nba') || game.leagueId.includes('ncaab')
      ? 'basketball'
      : game.leagueId.includes('mlb')
      ? 'baseball'
      : game.leagueId.includes('nhl')
      ? 'hockey'
      : game.leagueId.includes('premier') || game.leagueId.includes('liga')
      ? 'soccer'
      : game.leagueId.includes('ufc')
      ? 'mma'
      : 'football';
      
    return sportMap[sportType] || '🏆';
  };
  
  // Helper to format game time
  const formatGameTime = (game: Game): string => {
    if (game.status === 'live') {
      return 'Live Now';
    }
    
    const gameDate = new Date(game.startTime);
    const now = new Date();
    const isToday = gameDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today`;
    } else {
      return gameDate.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Featured Events</CardTitle>
        <CardDescription>Popular upcoming events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-accent/50 rounded-md p-3">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <div className="flex justify-between mt-1">
                  <Skeleton className="h-4 w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {featuredGames.map((game) => (
              <Link 
                to={`/sportsbook/${game.id}`}
                key={game.id} 
                className="bg-accent/50 rounded-md p-3 hover:bg-accent/70 transition-colors cursor-pointer block"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {getSportEmoji(game)} {formatGameLeague(game.leagueId)} • {formatGameTime(game)}
                </div>
                <div className="font-medium">
                  {game.homeTeam.name} vs {game.awayTeam.name}
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>{game.status === 'live' ? 'Live' : 'Upcoming'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions for formatting game data
function formatGameLeague(leagueId: string): string {
  if (leagueId.includes('nfl')) return 'NFL';
  if (leagueId.includes('nba')) return 'NBA';
  if (leagueId.includes('mlb')) return 'MLB';
  if (leagueId.includes('nhl')) return 'NHL';
  if (leagueId.includes('premier') || leagueId.includes('eng.1')) return 'Premier League';
  if (leagueId.includes('laliga') || leagueId.includes('esp.1')) return 'La Liga';
  return leagueId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
