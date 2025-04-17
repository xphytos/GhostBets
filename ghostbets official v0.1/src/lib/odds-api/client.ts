import { supabase } from '@/lib/supabase';
import { OddsApiEvent } from '@/types/betting';

// Function to validate if the data is an OddsApiEvent array
function isOddsApiResponseArray(data: any): data is OddsApiEvent[] {
  if (!Array.isArray(data)) {
    return false;
  }
  
  // Check if first item has required properties (basic validation)
  if (data.length === 0) {
    return true; // Empty array is valid
  }
  
  const item = data[0];
  return typeof item === 'object' && 
    'id' in item && 
    'sport_key' in item && 
    'sport_title' in item && 
    'commence_time' in item && 
    'home_team' in item && 
    'away_team' in item;
}

// Function to fetch game data from cache - US only now
export async function fetchOddsData(): Promise<OddsApiEvent[]> {
  try {
    // Create a cache key that includes the current month and year
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const cacheKey = `odds_api_us_h2h,spreads,totals_${year}_${month}`;
    
    console.log(`Fetching odds data from cache with key: ${cacheKey}`);
    
    // Try to get cached data from Supabase
    const { data: cachedData, error } = await supabase
      .from('api_cache')
      .select('data, cached_at')
      .eq('key', cacheKey)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching cached odds data:', error);
      return hardcodedTestOddsData();
    }
    
    if (cachedData) {
      console.log(`Using odds data from cache, last updated: ${cachedData.cached_at}`);
      
      // Safely cast the data with validation
      if (isOddsApiResponseArray(cachedData.data)) {
        return cachedData.data;
      } else {
        console.error('Cached data is not in the expected format');
        return hardcodedTestOddsData();
      }
    } else {
      console.log('No cached odds data found');
      // For testing/demo purposes, use hardcoded data if nothing in cache
      return hardcodedTestOddsData();
    }
  } catch (error) {
    console.error('Error in odds API client:', error);
    return hardcodedTestOddsData(); // Fall back to hardcoded data
  }
}

// Function to provide hardcoded odds data for testing when no cache is available
function hardcodedTestOddsData(): OddsApiEvent[] {
  // Expanded test data with various teams and odds
  return [
    {
      id: "a22635f3bf66e2b73ef464e660fa3f41",
      sport_key: "basketball_nba",
      sport_title: "NBA",
      commence_time: "2025-04-17T02:13:00Z",
      home_team: "Sacramento Kings",
      away_team: "Dallas Mavericks",
      bookmakers: [
        {
          key: "betmgm",
          title: "BetMGM",
          last_update: "2025-04-17T04:25:19Z",
          markets: [
            {
              key: "h2h",
              last_update: "2025-04-17T04:25:19Z",
              outcomes: [
                { name: "Dallas Mavericks", price: -180 },
                { name: "Sacramento Kings", price: +155 }
              ]
            },
            {
              key: "spreads",
              last_update: "2025-04-17T04:25:19Z",
              outcomes: [
                { name: "Dallas Mavericks", price: -110, point: -4.5 },
                { name: "Sacramento Kings", price: -110, point: +4.5 }
              ]
            },
            {
              key: "totals",
              last_update: "2025-04-17T04:25:19Z",
              outcomes: [
                { name: "Over", price: -110, point: 220.5 },
                { name: "Under", price: -110, point: 220.5 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "0a2616adcc59aa00e128de19a5bd714d",
      sport_key: "baseball_mlb",
      sport_title: "MLB",
      commence_time: "2025-04-17T02:08:00Z",
      home_team: "Los Angeles Dodgers",
      away_team: "Colorado Rockies",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: "2025-04-17T04:26:17Z",
          markets: [
            {
              key: "h2h",
              last_update: "2025-04-17T04:26:17Z",
              outcomes: [
                { name: "Colorado Rockies", price: +260 },
                { name: "Los Angeles Dodgers", price: -320 }
              ]
            },
            {
              key: "spreads",
              last_update: "2025-04-17T04:26:17Z",
              outcomes: [
                { name: "Colorado Rockies", price: -110, point: +1.5 },
                { name: "Los Angeles Dodgers", price: -110, point: -1.5 }
              ]
            },
            {
              key: "totals",
              last_update: "2025-04-17T04:26:17Z",
              outcomes: [
                { name: "Over", price: -110, point: 8.5 },
                { name: "Under", price: -110, point: 8.5 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "7b3fc490aa7c81a35645d5e4b2f7954c",
      sport_key: "basketball_nba",
      sport_title: "NBA",
      commence_time: "2025-04-18T00:00:00Z",
      home_team: "Boston Celtics",
      away_team: "Miami Heat",
      bookmakers: [
        {
          key: "fanduel",
          title: "FanDuel",
          last_update: "2025-04-17T04:25:00Z",
          markets: [
            {
              key: "h2h",
              last_update: "2025-04-17T04:25:00Z",
              outcomes: [
                { name: "Miami Heat", price: +330 },
                { name: "Boston Celtics", price: -420 }
              ]
            },
            {
              key: "spreads",
              last_update: "2025-04-17T04:25:00Z",
              outcomes: [
                { name: "Miami Heat", price: -110, point: +9.5 },
                { name: "Boston Celtics", price: -110, point: -9.5 }
              ]
            },
            {
              key: "totals",
              last_update: "2025-04-17T04:25:00Z",
              outcomes: [
                { name: "Over", price: -110, point: 217.5 },
                { name: "Under", price: -110, point: 217.5 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "d456f9a78c21b0e45d789f1a2b3c4d5e",
      sport_key: "soccer_epl",
      sport_title: "Premier League",
      commence_time: "2025-04-18T14:00:00Z",
      home_team: "Liverpool FC",
      away_team: "Manchester United",
      bookmakers: [
        {
          key: "caesars",
          title: "Caesars",
          last_update: "2025-04-17T04:30:00Z",
          markets: [
            {
              key: "h2h",
              last_update: "2025-04-17T04:30:00Z",
              outcomes: [
                { name: "Manchester United", price: +450 },
                { name: "Liverpool FC", price: -175 },
                { name: "Draw", price: +310 }
              ]
            },
            {
              key: "spreads",
              last_update: "2025-04-17T04:30:00Z",
              outcomes: [
                { name: "Manchester United", price: -105, point: +1.5 },
                { name: "Liverpool FC", price: -115, point: -1.5 }
              ]
            },
            {
              key: "totals",
              last_update: "2025-04-17T04:30:00Z",
              outcomes: [
                { name: "Over", price: -110, point: 2.5 },
                { name: "Under", price: -110, point: 2.5 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
      sport_key: "hockey_nhl",
      sport_title: "NHL",
      commence_time: "2025-04-18T23:00:00Z",
      home_team: "New York Rangers",
      away_team: "Washington Capitals",
      bookmakers: [
        {
          key: "pointsbet",
          title: "PointsBet",
          last_update: "2025-04-17T04:28:00Z",
          markets: [
            {
              key: "h2h",
              last_update: "2025-04-17T04:28:00Z",
              outcomes: [
                { name: "Washington Capitals", price: +155 },
                { name: "New York Rangers", price: -185 }
              ]
            },
            {
              key: "spreads",
              last_update: "2025-04-17T04:28:00Z",
              outcomes: [
                { name: "Washington Capitals", price: -110, point: +1.5 },
                { name: "New York Rangers", price: -110, point: -1.5 }
              ]
            },
            {
              key: "totals",
              last_update: "2025-04-17T04:28:00Z",
              outcomes: [
                { name: "Over", price: -110, point: 6.5 },
                { name: "Under", price: -110, point: 6.5 }
              ]
            }
          ]
        }
      ]
    }
  ];
}

// Preload game data for faster access
export async function preloadOddsData(): Promise<OddsApiEvent[]> {
  try {
    console.log('Preloading odds data...');
    const data = await fetchOddsData();
    console.log(`Odds data preloaded successfully: ${data.length} events`);
    return data;
  } catch (error) {
    console.error('Error preloading odds data:', error);
    return [];
  }
}

// Refresh odds data via the edge function
export async function refreshOddsData(): Promise<boolean> {
  try {
    // Call the Supabase Edge Function to refresh the odds data
    console.log('Refreshing odds data via edge function');
    
    // Use the supabase client to call the edge function
    const { data, error } = await supabase.functions.invoke('refresh-odds-data', {
      method: 'POST',
    });
    
    if (error) {
      console.warn('Odds refresh API returned an error, but continuing with cached data:', error);
      return false;
    }
    
    console.log('Odds data refreshed successfully:', data);
    return true;
  } catch (error) {
    console.warn('Odds refresh API returned an error, but continuing with cached data:', error);
    return false;
  }
}

// Immediately trigger a refresh when the module is imported
refreshOddsData().catch(console.error);
