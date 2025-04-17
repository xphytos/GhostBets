import { Game, Team, SportType } from "@/types/betting";
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { getSportTypeFromLeagueId } from './leagues';
import { getApiSportsGames } from '@/lib/api-sports/client';

// Helper function to generate a random date in the near future
export function getRandomFutureDate(minDaysAhead = 1, maxDaysAhead = 14): Date {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * (maxDaysAhead - minDaysAhead + 1)) + minDaysAhead;
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + randomDays);
  return futureDate;
}

// Helper function to generate a random time
export function getRandomTime(): string {
  const hours = Math.floor(Math.random() * 12) + 1;
  const minutes = Math.random() > 0.5 ? '00' : '30';
  const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
  return `${hours}:${minutes} ${ampm}`;
}

// Helper function to map teams from database to our type
export function mapTeam(teamData: any, leagueId: string): Team {
  if (!teamData) {
    return {
      id: 'unknown',
      name: 'Unknown Team',
      abbreviation: 'UNK',
      leagueId: leagueId,
      colorMain: '#cccccc',
      colorSecondary: '#ffffff'
    };
  }
  
  return {
    id: teamData.id,
    name: teamData.name,
    abbreviation: teamData.abbreviation || 'UNK',
    mascot: teamData.mascot,
    location: teamData.location,
    logo: '',
    leagueId: teamData.league_id || leagueId,
    record: teamData.record,
    colorMain: teamData.color_main || '#cccccc',
    colorSecondary: teamData.color_secondary || '#ffffff',
    stats: teamData.stats
  };
}

// Helper function to map weather data
export function mapWeather(weatherData: any): Game['weather'] {
  if (!weatherData) return undefined;
  
  return {
    temperature: weatherData.temperature,
    condition: weatherData.condition,
    windSpeed: weatherData.wind_speed
  };
}

// Updated fetchGamesByLeague to try API-Sports first, then fallback to sample data
export const fetchGamesByLeague = async (leagueId: string): Promise<Game[]> => {
  try {
    // Get current date in ISO format
    const now = new Date().toISOString();
    
    // Get sport type for this league
    const sportType = getSportTypeFromLeagueId(leagueId);
    
    // Try to fetch games from API-Sports first
    try {
      const apiGames = await getApiSportsGames(leagueId, sportType);
      if (apiGames && apiGames.length > 0) {
        console.log(`Found ${apiGames.length} games from API-Sports for league ${leagueId}`);
        
        // Add user bet data to the games
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData || !userData.user) {
          return apiGames;
        }
        
        const { data: userBetsData, error: betsError } = await supabase
          .from('bets')
          .select('game_id, bet_type')
          .filter('user_id', 'eq', userData.user.id);
        
        if (betsError) {
          console.error("Error fetching user bets:", betsError);
          return apiGames;
        }
        
        // Create a map of game_id -> Set of bet_types the user has already placed
        const userBetMap = new Map<string, Set<string>>();
        
        if (userBetsData) {
          userBetsData.forEach(bet => {
            if (!userBetMap.has(bet.game_id)) {
              userBetMap.set(bet.game_id, new Set());
            }
            userBetMap.get(bet.game_id)?.add(bet.bet_type);
          });
        }
        
        // Add user bet info to the games
        const gamesWithBetInfo = apiGames.map(game => ({
          ...game,
          userBets: userBetMap.get(game.id) || new Set<string>()
        }));
        
        // Sort by start time
        return gamesWithBetInfo.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      }
    } catch (apiError) {
      console.error("Error fetching games from API-Sports:", apiError);
    }
    
    // Fallback to Supabase if API-Sports didn't return data
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!games_home_team_fkey(*),
        away_team:teams!games_away_team_fkey(*)
      `)
      .filter('league_id', 'eq', leagueId)
      .gte('start_time', now.split('T')[0]);
    
    if (gamesError) {
      console.error("Error fetching games:", gamesError);
      return generateSampleGamesForLeague(leagueId);
    }

    // If no games found, generate sample games
    if (!gamesData || gamesData.length === 0) {
      console.log(`No games found for league ${leagueId}, generating sample games`);
      return generateSampleGamesForLeague(leagueId);
    }
    
    // Get user's existing bets to track user bet types
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      // If no user, return games without bet tracking
      return gamesData.map(game => ({
        id: game.id,
        homeTeam: mapTeam(game.home_team, leagueId),
        awayTeam: mapTeam(game.away_team, leagueId),
        startTime: game.start_time,
        status: game.status as 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled',
        leagueId: game.league_id,
        location: game.location || '',
        broadcasters: game.broadcasters || [],
        attendance: game.attendance || undefined,
        weather: mapWeather(game.weather),
        score: game.score as { home: number; away: number } | undefined,
        quarter: game.quarter,
        timeRemaining: game.time_remaining,
        userBets: new Set<string>()
      })).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    
    const { data: userBetsData, error: betsError } = await supabase
      .from('bets')
      .select('game_id, bet_type')
      .filter('user_id', 'eq', userData.user.id);
    
    if (betsError) {
      console.error("Error fetching user bets:", betsError);
      // Return games without bet tracking if error occurs
      return gamesData.map(game => ({
        id: game.id,
        homeTeam: mapTeam(game.home_team, leagueId),
        awayTeam: mapTeam(game.away_team, leagueId),
        startTime: game.start_time,
        status: game.status as 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled',
        leagueId: game.league_id,
        location: game.location || '',
        broadcasters: game.broadcasters || [],
        attendance: game.attendance || undefined,
        weather: mapWeather(game.weather),
        score: game.score as { home: number; away: number } | undefined,
        quarter: game.quarter,
        timeRemaining: game.time_remaining,
        userBets: new Set<string>()
      })).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    
    // Create a map of game_id -> Set of bet_types the user has already placed
    const userBetMap = new Map<string, Set<string>>();
    
    if (userBetsData) {
      userBetsData.forEach(bet => {
        if (!userBetMap.has(bet.game_id)) {
          userBetMap.set(bet.game_id, new Set());
        }
        userBetMap.get(bet.game_id)?.add(bet.bet_type);
      });
    }
    
    // Map the database fields to our TypeScript types and attach user bet info
    const gamesWithBetInfo = gamesData.map(game => ({
      id: game.id,
      homeTeam: mapTeam(game.home_team, leagueId),
      awayTeam: mapTeam(game.away_team, leagueId),
      startTime: game.start_time,
      status: game.status as 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled',
      leagueId: game.league_id,
      location: game.location || '',
      broadcasters: game.broadcasters || [],
      attendance: game.attendance || undefined,
      weather: mapWeather(game.weather),
      score: game.score as { home: number; away: number } | undefined,
      quarter: game.quarter,
      timeRemaining: game.time_remaining,
      userBets: userBetMap.get(game.id) || new Set<string>()
    }));
    
    // Sort by start time
    return gamesWithBetInfo.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  } catch (error) {
    console.error("Error in fetchGamesByLeague:", error);
    return generateSampleGamesForLeague(leagueId);
  }
};

// Sample teams for various leagues
export const generateSampleTeams = (sportType: SportType, leagueId: string): [Team, Team] => {
  let homeTeam: Team, awayTeam: Team;
  
  // Generate different teams based on the league ID
  switch (leagueId) {
    // Football
    case 'nfl':
      homeTeam = {
        id: 'chiefs',
        name: 'Kansas City Chiefs',
        abbreviation: 'KC',
        mascot: 'Chiefs',
        location: 'Kansas City',
        logo: '',
        leagueId: leagueId,
        record: '12-4',
        colorMain: '#E31837',
        colorSecondary: '#FFB81C'
      };
      awayTeam = {
        id: '49ers',
        name: 'San Francisco 49ers',
        abbreviation: 'SF',
        mascot: '49ers',
        location: 'San Francisco',
        logo: '',
        leagueId: leagueId,
        record: '11-5',
        colorMain: '#AA0000',
        colorSecondary: '#B3995D'
      };
      break;
      
    // Basketball
    case 'nba':
      homeTeam = {
        id: 'lakers',
        name: 'Los Angeles Lakers',
        abbreviation: 'LAL',
        mascot: 'Lakers',
        location: 'Los Angeles',
        logo: '',
        leagueId: leagueId,
        record: '42-28',
        colorMain: '#552583',
        colorSecondary: '#FDB927'
      };
      awayTeam = {
        id: 'celtics',
        name: 'Boston Celtics',
        abbreviation: 'BOS',
        mascot: 'Celtics',
        location: 'Boston',
        logo: '',
        leagueId: leagueId,
        record: '48-22',
        colorMain: '#007A33',
        colorSecondary: '#BA9653'
      };
      break;
    
    // Soccer
    case 'premier-league':
      homeTeam = {
        id: 'man-city',
        name: 'Manchester City',
        abbreviation: 'MCI',
        mascot: 'Citizens',
        location: 'Manchester',
        logo: '',
        leagueId: leagueId,
        record: '25-5-2',
        colorMain: '#6CADDF',
        colorSecondary: '#FFFFFF'
      };
      awayTeam = {
        id: 'man-utd',
        name: 'Manchester United',
        abbreviation: 'MUN',
        mascot: 'Red Devils',
        location: 'Manchester',
        logo: '',
        leagueId: leagueId,
        record: '18-9-5',
        colorMain: '#DA291C',
        colorSecondary: '#FBE122'
      };
      break;
      
    // Default case for all other leagues
    default:
      // Generate generic teams based on the sport type
      const sportName = getSportTypeFromLeagueId(leagueId);
      homeTeam = {
        id: `home-team-${leagueId}`,
        name: `Home ${sportName} Team`,
        abbreviation: 'HOME',
        mascot: 'Eagles',
        location: 'Home City',
        logo: '',
        leagueId: leagueId,
        record: '10-5',
        colorMain: '#336699',
        colorSecondary: '#FFFFFF'
      };
      awayTeam = {
        id: `away-team-${leagueId}`,
        name: `Away ${sportName} Team`,
        abbreviation: 'AWAY',
        mascot: 'Tigers',
        location: 'Away City',
        logo: '',
        leagueId: leagueId,
        record: '8-7',
        colorMain: '#993366',
        colorSecondary: '#FFFFFF'
      };
  }
  
  return [homeTeam, awayTeam];
};

// Function to generate sample games for a league
export function generateSampleGamesForLeague(leagueId: string): Game[] {
  const sportType = getSportTypeFromLeagueId(leagueId);
  const games: Game[] = [];
  
  // Generate 5 sample games for the league
  for (let i = 0; i < 5; i++) {
    const futureDate = getRandomFutureDate();
    const gameId = uuidv4();
    const [homeTeam, awayTeam] = generateSampleTeams(sportType, leagueId);
    
    games.push({
      id: gameId,
      homeTeam,
      awayTeam,
      startTime: new Date(
        futureDate.setHours(Math.floor(Math.random() * 12) + 12, 
                          Math.random() > 0.5 ? 0 : 30, 0, 0)
      ).toISOString(),
      leagueId,
      status: 'scheduled',
      location: `${homeTeam.location} Arena`,
      broadcasters: ['ESPN', 'FOX'],
      weather: sportType === 'football' || sportType === 'soccer' ? {
        temperature: Math.floor(Math.random() * 30) + 50, // 50-80 degrees
        condition: Math.random() > 0.8 ? 'Rainy' : Math.random() > 0.5 ? 'Cloudy' : 'Sunny',
        windSpeed: Math.floor(Math.random() * 20)
      } : undefined,
      userBets: new Set<string>()
    });
  }
  
  return games;
}
