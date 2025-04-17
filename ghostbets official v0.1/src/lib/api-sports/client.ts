
import { supabase } from '@/integrations/supabase/client';
import { Game, League, SportType, Team, BetLine } from '@/types/betting';
import { mapTeam } from '@/lib/betting/games';
import { v4 as uuidv4 } from 'uuid';

// Interface for API Sports request options
export interface ApiSportsRequestOptions {
  // Whether to use cache
  useCache?: boolean;
  // Override default 15 minutes cache TTL
  cacheTTL?: number;
  // Override base URL
  baseUrl?: string;
  // Additional headers to send with the request
  extraHeaders?: Record<string, string>;
  // Debug mode
  debug?: boolean;
}

// Function to fetch cached data or make API call for API-Sports
export const getApiSportsData = async (
  endpoint: string, 
  sport: string, 
  params: Record<string, any>,
  options: ApiSportsRequestOptions = {}
) => {
  try {
    // Set default options
    const defaultOptions: ApiSportsRequestOptions = {
      useCache: true,
      cacheTTL: 1440,  // 24 hours by default to respect API limits
      debug: false
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Create cache key
    const cacheKey = `${sport}-${endpoint}-${JSON.stringify(params)}`;
    
    if (mergedOptions.debug) {
      console.log('API Sports Request:', {
        sport,
        endpoint,
        params,
        options: mergedOptions
      });
    }
    
    try {
      // Make API call via edge function
      const { data: apiData, error } = await supabase.functions.invoke('fetch-api-sports', {
        body: {
          sport,
          endpoint,
          params,
          useCache: mergedOptions.useCache,
          cacheKey: mergedOptions.useCache ? cacheKey : null,
          options: {
            cacheTTL: mergedOptions.cacheTTL,
            baseUrl: mergedOptions.baseUrl,
            extraHeaders: mergedOptions.extraHeaders,
          }
        }
      });
      
      if (error) {
        console.error('Error invoking edge function:', error);
        return null;
      }
      
      if (mergedOptions.debug && apiData.fromCache) {
        console.log(`Using cached data for ${cacheKey}, age: ${apiData.cacheAge} minutes`);
      }
      
      return apiData.data;
    } catch (apiError) {
      console.error('Error in API call:', apiError);
      return null;
    }
  } catch (error) {
    console.error(`Error in getApiSportsData for ${sport}/${endpoint}:`, error);
    return null;
  }
};

// Function to fetch leagues from API-Sports with extended options
export const getApiSportsLeagues = async (
  sportType: SportType, 
  options: ApiSportsRequestOptions = {}
): Promise<League[]> => {
  try {
    // Get the appropriate sport API prefix
    const sport = getSportApiPrefix(sportType);
    if (!sport) return [];
    
    // Define custom parameters for the leagues endpoint based on sport type
    const params: Record<string, any> = {
      current: true
    };
    
    // Sport-specific league filters
    switch (sportType) {
      case 'football': // American Football
        params.country = ['USA'];
        params.type = 'league';
        break;
      case 'basketball':
        params.country = ['USA'];
        params.type = 'league';
        break;
      case 'baseball':
        params.country = ['USA'];
        params.type = 'league';
        break;
      case 'hockey':
        params.country = ['USA', 'Canada'];
        params.type = 'league';
        break;
      case 'soccer':
        params.country = ['England', 'Spain', 'Germany', 'Italy', 'France', 'USA'];
        params.type = 'league';
        break;
      case 'mma':
        // MMA doesn't typically use leagues in the same way
        params.type = 'league';
        break;
      case 'formula1':
        params.type = 'league';
        break;
      default:
        // Default params for other sports
        params.type = 'league';
        break;
    }
    
    // Get leagues for this sport
    const leaguesData = await getApiSportsData('leagues', sport, params, options);
    
    if (!leaguesData || !leaguesData.response) {
      console.log('No leagues data found for', sportType);
      return [];
    }
    
    // Transform leagues data to our League model
    const leagues: League[] = leaguesData.response.map((leagueData: any) => {
      // Define featured leagues for each sport
      let featured = false;
      
      // Define featured leagues by sport type
      switch (sportType) {
        case 'football':
          featured = ['1', '2'].includes(`${leagueData.league.id}`); // NFL, NCAA
          break;
        case 'basketball':
          featured = ['12', '13'].includes(`${leagueData.league.id}`); // NBA, NCAA
          break;
        case 'baseball':
          featured = ['1'].includes(`${leagueData.league.id}`); // MLB
          break;
        case 'hockey':
          featured = ['57'].includes(`${leagueData.league.id}`); // NHL
          break;
        case 'soccer':
          featured = ['39', '140', '78', '135', '61', '253'].includes(`${leagueData.league.id}`); // Top leagues
          break;
        default:
          featured = false;
      }
      
      return {
        id: `${leagueData.league.id}`,
        name: leagueData.league.name,
        sportType,
        country: leagueData.country?.name || '',
        logo: leagueData.league?.logo || '',
        active: true,
        featured: featured,
      };
    });
    
    return leagues;
  } catch (error) {
    console.error('Error fetching leagues from API-Sports:', error);
    return [];
  }
};

// Function to fetch games from API-Sports with extended options
export const getApiSportsGames = async (
  leagueId: string, 
  sportType: SportType,
  options: ApiSportsRequestOptions = {}
): Promise<Game[]> => {
  try {
    // Map our internal league ID to API-Sports league ID
    const apiLeagueId = mapLeagueIdToApiId(leagueId, sportType);
    if (!apiLeagueId) return [];
    
    // Get the appropriate sport API prefix
    const sport = getSportApiPrefix(sportType);
    if (!sport) return [];
    
    // Define parameters based on sport type
    const params: Record<string, any> = {
      league: apiLeagueId,
    };
    
    // Adjust parameters based on sport type for more targeted API calls
    switch (sportType) {
      case 'football': // American Football
        params.next = 30; // Get upcoming fixtures
        params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        break;
      case 'basketball':
        params.next = 30;
        params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        break;
      case 'baseball':
        params.next = 30;
        params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        break;
      case 'hockey':
        params.next = 30;
        params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        break;
      case 'soccer':
        params.next = 15;
        params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        break;
      default:
        params.next = 15;
        params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    // Get fixtures for this league
    const fixturesData = await getApiSportsData('fixtures', sport, params, options);
    
    if (!fixturesData || !fixturesData.response) {
      console.log('No fixtures data found for', leagueId);
      return [];
    }
    
    // Transform fixtures data to our Game model
    const games: Game[] = fixturesData.response.map((fixture: any) => {
      // Create team objects
      const homeTeam: Team = mapTeam(fixture.teams.home, leagueId);
      const awayTeam: Team = mapTeam(fixture.teams.away, leagueId);
      
      // Map fixture status to our status types
      let gameStatus: Game['status'] = 'scheduled';
      if (fixture.fixture.status.short === 'LIVE' || fixture.fixture.status.short === 'IN PLAY') gameStatus = 'live';
      else if (fixture.fixture.status.short === 'FT' || fixture.fixture.status.short === 'AET' || fixture.fixture.status.short === 'PEN') gameStatus = 'final';
      else if (fixture.fixture.status.short === 'PST' || fixture.fixture.status.short === 'DEL') gameStatus = 'postponed';
      else if (fixture.fixture.status.short === 'CANC' || fixture.fixture.status.short === 'ABD') gameStatus = 'cancelled';
      
      // Create game object
      return {
        id: `${fixture.fixture.id}`,
        homeTeam,
        awayTeam,
        startTime: fixture.fixture.date,
        status: gameStatus,
        leagueId,
        location: fixture.fixture.venue?.name || '',
        broadcasters: [],
        score: fixture.score.fulltime ? {
          home: fixture.goals.home || 0,
          away: fixture.goals.away || 0
        } : undefined,
        timeRemaining: fixture.fixture.status.elapsed ? `${fixture.fixture.status.elapsed}'` : undefined,
        userBets: new Set<string>()
      };
    });
    
    return games;
  } catch (error) {
    console.error('Error fetching games from API-Sports:', error);
    return [];
  }
};

// Function to fetch betting lines from API-Sports with extended options
export const getApiSportsBetLines = async (
  gameId: string,
  options: ApiSportsRequestOptions = {}
): Promise<BetLine[]> => {
  try {
    // For now, we'll return mock betting lines since the API doesn't provide this
    // In a production environment, you would make an API call to get actual betting lines
    
    // Generate realistic odds based on the game ID to ensure consistency
    // This uses the gameId as a seed to generate consistent odds for the same game
    const seed = parseInt(gameId.replace(/[^0-9]/g, '').substring(0, 8)) || 1;
    const generateOdds = (base: number, variance: number) => {
      const random = (Math.sin(seed * base) + 1) / 2; // Pseudo-random between 0-1 based on seed
      return Math.round((base + (random * variance * 2 - variance)) * 10) / 10;
    };
    
    // Create moneyline odds
    const homeMoneyline = Math.random() > 0.5 ? 
      generateOdds(150, 100) : 
      generateOdds(-120, 80);
    
    const awayMoneyline = homeMoneyline > 0 ? 
      generateOdds(-120, 80) : 
      generateOdds(150, 100);
    
    // Create spread odds
    const spreadValue = generateOdds(3.5, 2);
    const homeSpreadOdds = generateOdds(-110, 20);
    const awaySpreadOdds = generateOdds(-110, 20);
    
    // Create total odds
    const total = generateOdds(47.5, 10);
    const overOdds = generateOdds(-110, 20);
    const underOdds = generateOdds(-110, 20);
    
    const lines: BetLine[] = [
      {
        id: `${gameId}-moneyline`,
        gameId,
        type: 'moneyline',
        homeOdds: homeMoneyline,
        awayOdds: awayMoneyline,
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${gameId}-spreads`,
        gameId,
        type: 'spreads',
        homeSpread: -spreadValue,
        awaySpread: spreadValue,
        homeSpreadOdds: homeSpreadOdds,
        awaySpreadOdds: awaySpreadOdds,
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${gameId}-totals`,
        gameId,
        type: 'totals',
        total: total,
        overOdds: overOdds,
        underOdds: underOdds,
        updatedAt: new Date().toISOString(),
      }
    ];
    
    return lines;
  } catch (error) {
    console.error('Error fetching bet lines:', error);
    return [];
  }
};

// Helper function to generate team abbreviation
function getTeamAbbreviation(name: string): string {
  if (!name) return 'UNK';
  
  // If name contains spaces, use first letter of each word
  if (name.includes(' ')) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  }
  
  // Otherwise just return first 3 letters
  return name.substring(0, 3).toUpperCase();
}

// Helper function to map our league ID to API-Sports league ID
function mapLeagueIdToApiId(leagueId: string, sportType: SportType): number | null {
  const leagueMap: Record<string, number> = {
    // Football
    'nfl': 1,
    'ncaaf': 2,
    // Basketball
    'nba': 12,
    'ncaab': 13,
    // Baseball
    'mlb': 1,
    // Hockey
    'nhl': 57,
    // Soccer
    'premier-league': 39,
    'la-liga': 140,
    'bundesliga': 78,
    'serie-a': 135,
    'ligue-1': 61,
    'mls': 253,
    // Add more mappings as needed
  };
  
  return leagueMap[leagueId] || parseInt(leagueId) || null;
}

// Helper function to get API-Sports endpoint prefix for sport type
function getSportApiPrefix(sportType: SportType): string | null {
  const sportMap: Record<SportType, string> = {
    'football': 'american-football',
    'basketball': 'basketball',
    'baseball': 'baseball',
    'hockey': 'hockey',
    'soccer': 'football',
    'mma': 'mma',
    'rugby': 'rugby',
    'volleyball': 'volleyball',
    'formula1': 'formula-1',
    'afl': 'australian-football',
    'handball': 'handball'
  };
  
  return sportMap[sportType] || null;
}
