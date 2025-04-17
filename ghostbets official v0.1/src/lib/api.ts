import { SportType, League, Game, UserBet, BetLine, BetStatus, BetType } from "@/types/betting";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabase";
import { 
  getESPNLeagues, 
  getESPNGames, 
  generateESPNBetLines,
  supportedSports 
} from "./espn-api/client";

// Function to fetch all games for a specific league
export const fetchGamesByLeague = async (leagueId: string): Promise<Game[]> => {
  try {
    // First determine the sport type for this league
    const allLeagues = await fetchAllLeagues();
    const league = allLeagues.find(l => l.id === leagueId);
    if (!league) {
      console.error(`League with ID ${leagueId} not found`);
      return [];
    }
    
    const sportType = league.sportType;
    console.log(`Fetching games for league ${leagueId} (${sportType})`);
    const games = await getESPNGames(leagueId, sportType);
    return games;
  } catch (error) {
    console.error(`Error fetching games for league ${leagueId}:`, error);
    return [];
  }
};

// Function to fetch featured leagues
export const fetchFeaturedLeagues = async (): Promise<League[]> => {
  try {
    // Fetch all leagues and filter for featured ones
    const allLeagues = await fetchAllLeagues();
    return allLeagues.filter(league => league.featured);
  } catch (error) {
    console.error("Error fetching featured leagues:", error);
    return [];
  }
};

// Function to fetch live games
export const fetchLiveGames = async (): Promise<Game[]> => {
  try {
    // Get live games from each supported sport
    const liveGamesPromises = Object.keys(supportedSports)
      .filter(sport => {
        // Filter out sports that don't have any leagues defined
        const sportConfig = supportedSports[sport as SportType];
        return sportConfig.id && Object.keys(sportConfig.leagues).length > 0;
      })
      .map(sport => fetchGamesBySport(sport as SportType));
    
    const gamesResults = await Promise.all(liveGamesPromises);
    const allGames = gamesResults.flat();
    
    // Filter for live games only
    return allGames.filter(game => game.status === 'live');
  } catch (error) {
    console.error("Error fetching live games:", error);
    return [];
  }
};

// Function to fetch games by sport type
export const fetchGamesBySport = async (sportType: SportType): Promise<Game[]> => {
  try {
    // Check if this is a supported sport
    const sportConfig = supportedSports[sportType];
    if (!sportConfig || !sportConfig.id || Object.keys(sportConfig.leagues).length === 0) {
      console.error(`Sport type ${sportType} is not supported by ESPN API`);
      return [];
    }
    
    // For ESPN, we need to fetch leagues first and then get games for each league
    const leagues = await fetchLeaguesBySport(sportType);
    
    if (!leagues || leagues.length === 0) {
      console.error(`No leagues found for sport: ${sportType}`);
      return [];
    }

    console.log(`Found ${leagues.length} leagues for ${sportType}:`, leagues.map(l => l.name));

    // Fetch games for all leagues of this sport type
    let allGames: Game[] = [];
    
    // Use Promise.all to fetch games for all leagues in parallel
    const gamesPromises = leagues.map(league => fetchGamesByLeague(league.id));
    const gamesArrays = await Promise.all(gamesPromises);
    
    // Combine all games
    allGames = gamesArrays.flat();
    
    return allGames;
  } catch (error) {
    console.error(`Error fetching games for sport ${sportType}:`, error);
    return [];
  }
};

// Function to fetch leagues by sport type - with caching
let leaguesBySportCache: Record<SportType, League[]> = {} as Record<SportType, League[]>;
let leaguesBySportCacheTimestamp: Record<SportType, number> = {} as Record<SportType, number>;
const LEAGUES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const fetchLeaguesBySport = async (sportType: SportType): Promise<League[]> => {
  try {
    // Check if we have a valid cached result
    const now = Date.now();
    if (leaguesBySportCache[sportType] && 
        leaguesBySportCacheTimestamp[sportType] && 
        now - leaguesBySportCacheTimestamp[sportType] < LEAGUES_CACHE_TTL) {
      // Return cached result if it's still valid
      return leaguesBySportCache[sportType];
    }
    
    console.log(`Fetching leagues for sport: ${sportType}`);
    // Check if this is a supported sport
    const sportConfig = supportedSports[sportType];
    if (!sportConfig || !sportConfig.id) {
      console.log(`Sport type ${sportType} is not supported by ESPN API`);
      return [];
    }
    
    const leagues = await getESPNLeagues(sportType);
    console.log(`Found ${leagues.length} leagues for ${sportType}:`, leagues.map(l => l.name));
    
    // Update cache
    leaguesBySportCache[sportType] = leagues;
    leaguesBySportCacheTimestamp[sportType] = now;
    
    return leagues;
  } catch (error) {
    console.error(`Error fetching leagues for sport ${sportType}:`, error);
    return [];
  }
};

// Function to fetch all leagues across all sports - with caching
let allLeaguesCache: League[] | null = null;
let allLeaguesCacheTimestamp: number = 0;
const ALL_LEAGUES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const fetchAllLeagues = async (): Promise<League[]> => {
  try {
    // Check if we have a valid cached result
    const now = Date.now();
    if (allLeaguesCache && now - allLeaguesCacheTimestamp < ALL_LEAGUES_CACHE_TTL) {
      // Return cached result if it's still valid
      return allLeaguesCache;
    }
    
    // Only fetch leagues for supported sports with defined leagues
    const supportedSportTypes = Object.keys(supportedSports)
      .filter(sport => {
        const sportConfig = supportedSports[sport as SportType];
        return sportConfig.id && Object.keys(sportConfig.leagues).length > 0;
      })
      .map(sport => sport as SportType);
    
    console.log('Fetching leagues for supported sports:', supportedSportTypes);
    
    // Fetch leagues for all supported sports
    const leaguesPromises = supportedSportTypes.map(sport => fetchLeaguesBySport(sport));
    const leaguesArrays = await Promise.all(leaguesPromises);
    
    // Combine all leagues
    const allLeagues = leaguesArrays.flat();
    console.log(`Found ${allLeagues.length} leagues across all sports`);
    
    // Update cache
    allLeaguesCache = allLeagues;
    allLeaguesCacheTimestamp = now;
    
    return allLeagues;
  } catch (error) {
    console.error("Error fetching all leagues:", error);
    return [];
  }
};

// Function to fetch betting lines for a game
export const fetchBettingLines = async (gameId: string): Promise<BetLine[]> => {
  try {
    // Since ESPN doesn't provide betting odds, we'll use the bet-lines module
    const lines = await generateESPNBetLines(gameId);
    return lines;
  } catch (error) {
    console.error(`Error fetching betting lines for game ${gameId}:`, error);
    return [];
  }
};

// Function to fetch user's bets - optimized to not fetch other data
export const fetchUserBets = async (): Promise<UserBet[]> => {
  try {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session found, returning empty bets array");
      return [];
    }
    
    const userId = session.user.id;
    
    // Use a type assertion for the database query to fix TypeScript errors
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId as any)
      .order('placed_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching user bets:", error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    // Transform the data to match the UserBet interface with proper type casting
    return data.map(bet => ({
      id: bet.id,
      userId: bet.user_id,
      gameId: bet.game_id,
      betType: bet.bet_type as BetType,
      selection: bet.selection as 'home' | 'away' | 'over' | 'under' | 'draw',
      odds: bet.odds,
      stake: bet.stake,
      potentialWinnings: bet.potential_winnings,
      status: bet.status as BetStatus,
      placedAt: bet.placed_at,
      settledAt: bet.settled_at,
      result: bet.result as 'win' | 'loss' | 'push' | undefined,
      teams: bet.teams as { home: string; away: string } | undefined,
      score: bet.score as { home: number; away: number } | undefined,
      parlayId: bet.parlay_id,
      isParlay: bet.is_parlay,
      cashoutValue: bet.cashout_value,
      cashoutAvailable: bet.cashout_available
    }));
  } catch (error) {
    console.error("Error fetching user bets:", error);
    return [];
  }
};

// Function to place a bet
export const placeBet = async (bet: UserBet): Promise<void> => {
  try {
    // Ensure we're using a valid UUID format for the user ID
    if (!bet.userId) {
      throw new Error("User ID is required to place a bet");
    }
    
    console.log("Placing bet with user ID:", bet.userId);
    
    // Create a database insert object that matches the expected structure
    const dbBet: any = {
      id: bet.id || uuidv4(),
      user_id: bet.userId,
      game_id: bet.gameId,
      bet_type: bet.betType,
      selection: bet.selection,
      odds: bet.odds,
      stake: bet.stake,
      potential_winnings: bet.potentialWinnings,
      status: bet.status || 'open',
      placed_at: new Date().toISOString(),
      teams: bet.teams
    };
    
    // Use the typed object for the insert
    const { error } = await supabase
      .from('bets')
      .insert(dbBet);
      
    if (error) {
      console.error("Error in placeBet:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error placing bet:", error);
    throw error;
  }
};

// Function to get user's balance
export const getUserBalance = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching user balance:", error);
      return 15; // Default balance
    }
    
    return data?.balance || 15; // Default is now 15
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return 15; // Default balance
  }
};

// Initialize games and bet lines arrays for live updates but don't call the init function
export const GAMES: Game[] = [];
export const BET_LINES: BetLine[] = [];

import { preloadOddsData } from './odds-api/client';

// Just updating the initializeOddsData function to use the correct API URL
export const initializeOddsData = async () => {
  try {
    console.log('Preloading odds data...');
    await preloadOddsData();
    
    // Also directly trigger a refresh of the odds data via the edge function
    try {
      const response = await fetch(
        'https://cesltdnpizhouatyezok.supabase.co/functions/v1/refresh-odds-data', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        console.warn('Odds refresh API returned an error, but continuing with cached data');
      } else {
        console.log('Odds refresh edge function executed successfully');
      }
    } catch (refreshError) {
      console.warn('Could not call refresh-odds-data function, using cached data only:', refreshError);
    }
    
  } catch (error) {
    console.error('Error preloading odds data:', error);
  }
};

// Update to initialize odds data but don't wait for it to complete
initializeOddsData();
