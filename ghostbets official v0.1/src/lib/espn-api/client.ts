
import { supabase } from '@/integrations/supabase/client';
import { Game, League, SportType, Team, BetLine } from '@/types/betting';
import { v4 as uuidv4 } from 'uuid';

// Interface for ESPN API request options
export interface ESPNApiRequestOptions {
  useCache?: boolean;
  cacheTTL?: number;
  debug?: boolean;
}

// Supported sports mapping
export const supportedSports: Record<SportType, { id: string, leagues: Record<string, string> }> = {
  football: {
    id: 'football',
    leagues: {
      'nfl': 'nfl',
      'college-football': 'college-football'
    }
  },
  basketball: {
    id: 'basketball',
    leagues: {
      'nba': 'nba',
      'mens-college-basketball': 'mens-college-basketball'
    }
  },
  baseball: {
    id: 'baseball',
    leagues: {
      'mlb': 'mlb'
    }
  },
  hockey: {
    id: 'hockey',
    leagues: {
      'nhl': 'nhl'
    }
  },
  soccer: {
    id: 'soccer',
    leagues: {
      'eng.1': 'eng.1', // Premier League
      'esp.1': 'esp.1', // La Liga
      'ita.1': 'ita.1', // Serie A
      'ger.1': 'ger.1', // Bundesliga
      'fra.1': 'fra.1', // Ligue 1
      'usa.1': 'usa.1'  // MLS
    }
  },
  // Empty configurations for unsupported sports
  mma: { id: '', leagues: {} },
  rugby: { id: '', leagues: {} },
  volleyball: { id: '', leagues: {} }, 
  formula1: { id: '', leagues: {} },
  afl: { id: '', leagues: {} },
  handball: { id: '', leagues: {} }
};

// Function to fetch data from ESPN API via edge function
export const getESPNData = async (
  endpoint: string,
  params: Record<string, any> = {},
  options: ESPNApiRequestOptions = {}
) => {
  try {
    // Set default options
    const defaultOptions: ESPNApiRequestOptions = {
      useCache: true,
      cacheTTL: 60, // 1 hour by default
      debug: false
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Create cache key
    const cacheKey = `espn-${endpoint}-${JSON.stringify(params)}`;
    
    if (mergedOptions.debug) {
      console.log('ESPN API Request:', {
        endpoint,
        params,
        options: mergedOptions
      });
    }
    
    try {
      // Make API call via edge function
      const { data: apiData, error } = await supabase.functions.invoke('fetch-espn-api', {
        body: {
          endpoint,
          params,
          useCache: mergedOptions.useCache,
          cacheKey: mergedOptions.useCache ? cacheKey : null
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
    console.error(`Error in getESPNData for ${endpoint}:`, error);
    return null;
  }
};

// Function to fetch leagues from ESPN API
export const getESPNLeagues = async (
  sportType: SportType, 
  options: ESPNApiRequestOptions = {}
): Promise<League[]> => {
  try {
    // Check if this is a supported sport type
    const sportConfig = supportedSports[sportType];
    if (!sportConfig || !sportConfig.id) {
      console.log(`Sport type ${sportType} is not supported by ESPN API`);
      return [];
    }
    
    // For all sports, we'll create leagues based on the configured mapping
    // This ensures consistent league data across all sports
    return Object.entries(sportConfig.leagues).map(([slug, id]) => {
      let name = slug;
      let country = 'USA';
      
      // Map slugs to readable names
      if (sportType === 'soccer') {
        if (slug === 'eng.1') {
          name = 'Premier League';
          country = 'England';
        } else if (slug === 'esp.1') {
          name = 'La Liga';
          country = 'Spain';
        } else if (slug === 'ita.1') {
          name = 'Serie A';
          country = 'Italy';
        } else if (slug === 'ger.1') {
          name = 'Bundesliga';
          country = 'Germany';
        } else if (slug === 'fra.1') {
          name = 'Ligue 1';
          country = 'France';
        } else if (slug === 'usa.1') {
          name = 'MLS';
          country = 'USA';
        }
      } else if (sportType === 'football') {
        if (slug === 'nfl') {
          name = 'NFL';
          country = 'USA';
        } else if (slug === 'college-football') {
          name = 'NCAA Football';
          country = 'USA';
        }
      } else if (sportType === 'basketball') {
        if (slug === 'nba') {
          name = 'NBA';
          country = 'USA';
        } else if (slug === 'mens-college-basketball') {
          name = 'NCAA Basketball';
          country = 'USA';
        }
      } else if (sportType === 'baseball') {
        if (slug === 'mlb') {
          name = 'MLB';
          country = 'USA';
        }
      } else if (sportType === 'hockey') {
        if (slug === 'nhl') {
          name = 'NHL';
          country = 'USA';
        }
      }
      
      return {
        id: slug,
        name: name,
        sportType,
        country,
        active: true,
        featured: true,
      };
    });
    
  } catch (error) {
    console.error('Error fetching leagues from ESPN API:', error);
    return [];
  }
};

// Function to fetch games/events from ESPN API
export const getESPNGames = async (
  leagueId: string, 
  sportType: SportType,
  options: ESPNApiRequestOptions = {}
): Promise<Game[]> => {
  try {
    // Check if this is a supported sport type
    const sportConfig = supportedSports[sportType];
    if (!sportConfig || !sportConfig.id) {
      console.log(`Sport type ${sportType} is not supported by ESPN API`);
      return [];
    }
    
    // Calculate date range (today to 2 weeks from now)
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);  // 2 weeks ahead
    
    // Format dates for API (YYYYMMDD)
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0].replace(/-/g, '');
    };
    
    const startDate = formatDate(today);
    const endDate = formatDate(twoWeeksLater);
    
    // Determine league slug/abbreviation
    let leagueSlug = leagueId;
    
    // Endpoint for getting scoreboard (which includes games/events)
    const endpoint = `/sports/${sportConfig.id}/${leagueSlug}/scoreboard`;
    
    // Set additional parameters
    const params: Record<string, any> = {
      limit: 100, // Get more games
      dates: `${startDate}-${endDate}` // Date range parameter
    };
    
    // Get scoreboard data from ESPN with debug enabled
    const scoreboardData = await getESPNData(endpoint, params, { ...options, debug: true });
    
    if (!scoreboardData || !scoreboardData.events) {
      console.log('No events data found for', leagueId);
      return [];
    }
    
    // Transform ESPN events data to our Game model
    const games: Game[] = scoreboardData.events.map((event: any) => {
      // Process home and away teams
      const competitors = event.competitions[0]?.competitors || [];
      let homeTeam: any = null;
      let awayTeam: any = null;
      
      competitors.forEach((team: any) => {
        if (team.homeAway === 'home') {
          homeTeam = team;
        } else {
          awayTeam = team;
        }
      });
      
      // Map to our Team interface
      const mappedHomeTeam: Team = {
        id: homeTeam?.id || 'unknown',
        name: homeTeam?.team?.displayName || 'Unknown Team',
        abbreviation: homeTeam?.team?.abbreviation || 'UNK',
        logo: homeTeam?.team?.logo || '',
        leagueId,
        location: homeTeam?.team?.location || '',
        colorMain: homeTeam?.team?.color || '#000000',
        colorSecondary: homeTeam?.team?.alternateColor || '#FFFFFF',
        record: homeTeam?.records ? homeTeam.records[0]?.summary : ''
      };
      
      const mappedAwayTeam: Team = {
        id: awayTeam?.id || 'unknown',
        name: awayTeam?.team?.displayName || 'Unknown Team',
        abbreviation: awayTeam?.team?.abbreviation || 'UNK',
        logo: awayTeam?.team?.logo || '',
        leagueId,
        location: awayTeam?.team?.location || '',
        colorMain: awayTeam?.team?.color || '#000000',
        colorSecondary: awayTeam?.team?.alternateColor || '#FFFFFF',
        record: awayTeam?.records ? awayTeam.records[0]?.summary : ''
      };
      
      // Map status
      let gameStatus: Game['status'] = 'scheduled';
      if (event.status?.type?.state === 'in') {
        gameStatus = 'live';
      } else if (event.status?.type?.state === 'post') {
        gameStatus = 'final';
      } else if (event.status?.type?.description === 'Postponed') {
        gameStatus = 'postponed';
      } else if (event.status?.type?.description === 'Canceled') {
        gameStatus = 'cancelled';
      }
      
      // Get scores if available
      const score = gameStatus !== 'scheduled' ? {
        home: parseInt(homeTeam?.score || '0'),
        away: parseInt(awayTeam?.score || '0')
      } : undefined;
      
      // Create broadcasters array if available
      const broadcasters: string[] = [];
      if (event.competitions[0]?.broadcasts && event.competitions[0]?.broadcasts.length > 0) {
        event.competitions[0].broadcasts.forEach((broadcast: any) => {
          if (broadcast.names && broadcast.names.length > 0) {
            broadcasters.push(...broadcast.names);
          }
        });
      }
      
      // Get venue/location info
      const location = event.competitions[0]?.venue?.fullName || '';
      
      // Get game time remaining for live games
      let timeRemaining: string | undefined;
      if (gameStatus === 'live') {
        const period = event.status?.period || '';
        const clock = event.status?.displayClock || '';
        timeRemaining = `${period}${period ? 'Q' : ''} ${clock}`;
      }
      
      return {
        id: event.id,
        homeTeam: mappedHomeTeam,
        awayTeam: mappedAwayTeam,
        startTime: event.date,
        status: gameStatus,
        leagueId,
        location,
        broadcasters,
        score,
        timeRemaining,
        // Initialize empty user bets
        userBets: new Set<string>()
      };
    });
    
    return games;
  } catch (error) {
    console.error('Error fetching games from ESPN API:', error);
    return [];
  }
};

// Function to generate betting lines (since ESPN doesn't provide odds)
export const generateESPNBetLines = async (
  gameId: string,
  options: ESPNApiRequestOptions = {}
): Promise<BetLine[]> => {
  try {
    // Generate realistic odds based on the game ID to ensure consistency
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
    const spread = generateOdds(3.5, 2);
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
        id: `${gameId}-spread`,
        gameId,
        type: 'spread',
        spread: spread,
        homeOdds: homeSpreadOdds,
        awayOdds: awaySpreadOdds,
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${gameId}-total`,
        gameId,
        type: 'total',
        total: total,
        overOdds: overOdds,
        underOdds: underOdds,
        updatedAt: new Date().toISOString(),
      }
    ];
    
    return lines;
  } catch (error) {
    console.error('Error generating bet lines:', error);
    return [];
  }
};
