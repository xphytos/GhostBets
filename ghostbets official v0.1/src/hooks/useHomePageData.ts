import { useQuery } from '@tanstack/react-query';
import { fetchLiveGames, fetchGamesBySport, fetchAllLeagues } from '@/lib/api';
import { Game, SportType } from '@/types/betting';

export function useHomePageData() {
  // Fetch live games
  const { 
    data: liveGames = [], 
    isLoading: isLoadingLive 
  } = useQuery({
    queryKey: ['liveGames'],
    queryFn: () => fetchLiveGames(),
  });
  
  // Fetch popular games (using football and basketball as examples of popular sports)
  const { 
    data: footballGames = [], 
    isLoading: isLoadingFootball 
  } = useQuery({
    queryKey: ['games', 'football'],
    queryFn: () => fetchGamesBySport('football'),
  });
  
  const { 
    data: basketballGames = [], 
    isLoading: isLoadingBasketball 
  } = useQuery({
    queryKey: ['games', 'basketball'],
    queryFn: () => fetchGamesBySport('basketball'),
  });
  
  // Fetch upcoming games (could be from various sports)
  const { 
    data: soccerGames = [], 
    isLoading: isLoadingSoccer 
  } = useQuery({
    queryKey: ['games', 'soccer'],
    queryFn: () => fetchGamesBySport('soccer'),
  });
  
  // Fetch all leagues for the league section
  const {
    data: leagues = [],
    isLoading: isLoadingLeagues
  } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => fetchAllLeagues(),
  });

  // Filter for popular games (combine football and basketball, then take first 3)
  const popularGames = [...footballGames, ...basketballGames]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);
  
  // Live games are already fetched directly
  
  // For upcoming games, use a mix of different sports and filter for future games
  const upcomingGames = [...soccerGames, ...footballGames.slice(3, 6), ...basketballGames.slice(3, 6)]
    .filter(game => new Date(game.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);
  
  // Format games for the UI
  const formatGameForUI = (game: Game) => {
    return {
      id: game.id,
      title: getSportNameFromLeague(game.leagueId),
      teams: `${game.homeTeam.name} vs ${game.awayTeam.name}`,
      time: formatGameTime(game),
      featured: Math.random() > 0.7, // Random featured tag for some games
      gameObject: game
    };
  };
  
  // Format games for display
  const formattedPopularGames = popularGames.map(formatGameForUI);
  const formattedLiveGames = liveGames.map(formatGameForUI);
  const formattedUpcomingGames = upcomingGames.map(formatGameForUI);
  
  // Format popular leagues (take first 4)
  const formattedLeagues = leagues
    .filter(league => league.featured)
    .slice(0, 4)
    .map(league => ({
      id: league.id,
      name: league.name,
      members: Math.floor(Math.random() * 100) + 30 // Random member count for demo
    }));

  const isLoading = 
    isLoadingLive || 
    isLoadingFootball || 
    isLoadingBasketball || 
    isLoadingSoccer ||
    isLoadingLeagues;

  return {
    popularGames: formattedPopularGames,
    liveGames: formattedLiveGames,
    upcomingGames: formattedUpcomingGames,
    leagues: formattedLeagues,
    isLoading
  };
}

// Helper functions
function getSportNameFromLeague(leagueId: string): string {
  if (leagueId.includes('nfl') || leagueId.includes('football')) return 'NFL';
  if (leagueId.includes('nba') || leagueId.includes('basketball')) return 'NBA';
  if (leagueId.includes('mlb') || leagueId.includes('baseball')) return 'MLB';
  if (leagueId.includes('nhl') || leagueId.includes('hockey')) return 'NHL';
  if (leagueId.includes('premier') || leagueId.includes('eng.1')) return 'Premier League';
  if (leagueId.includes('laliga') || leagueId.includes('esp.1')) return 'La Liga';
  return leagueId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatGameTime(game: Game): string {
  if (game.status === 'live') {
    return game.timeRemaining || 'Live Now';
  }
  
  const gameDate = new Date(game.startTime);
  const now = new Date();
  const isToday = gameDate.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === gameDate.toDateString();
  
  if (isToday) {
    return `Today, ${gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isTomorrow) {
    return `Tomorrow, ${gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return gameDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
