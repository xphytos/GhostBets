
import { League, SportType } from "@/types/betting";
import { supabase } from '@/lib/supabase';

import { getApiSportsLeagues } from '@/lib/api-sports/client';

// Function to fetch all leagues
export const fetchAllLeagues = async (): Promise<League[]> => {
  try {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('active', true);
      
    if (error) {
      console.error("Error fetching all leagues:", error);
      return [];
    }
    
    return (data || []).map(league => ({
      id: league.id,
      name: league.name,
      sportType: league.sport_type as SportType,
      country: league.country || undefined,
      logo: league.logo || undefined,
      active: league.active,
      featured: league.featured || false,
      icon: league.icon || undefined
    }));
  } catch (error) {
    console.error("Error in fetchAllLeagues:", error);
    return [];
  }
};

// Function to fetch all leagues for a specific sport
export const fetchLeaguesBySport = async (sportType: SportType): Promise<League[]> => {
  try {
    // First, try to fetch leagues from Supabase
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('sport_type', sportType)
      .eq('active', true);
      
    if (error) {
      console.error("Error fetching leagues:", error);
      // If there's an error with Supabase, try to fetch from API-Sports
      try {
        const apiLeagues = await getApiSportsLeagues(sportType);
        if (apiLeagues.length > 0) {
          return apiLeagues;
        }
      } catch (apiError) {
        console.error("Error fetching leagues from API-Sports:", apiError);
      }
      
      return getSampleLeaguesForSport(sportType);
    }
    
    if (!data || data.length === 0) {
      // If no leagues found in Supabase, try to fetch from API-Sports
      try {
        const apiLeagues = await getApiSportsLeagues(sportType);
        if (apiLeagues.length > 0) {
          return apiLeagues;
        }
      } catch (apiError) {
        console.error("Error fetching leagues from API-Sports:", apiError);
      }
      
      // If still no leagues, generate sample leagues
      return getSampleLeaguesForSport(sportType);
    }
    
    // Map the database fields to our TypeScript types
    return data.map(league => ({
      id: league.id,
      name: league.name,
      sportType: league.sport_type as SportType,
      country: league.country || undefined,
      logo: league.logo || undefined,
      active: league.active,
      featured: league.featured || false,
      icon: league.icon || undefined
    }));
    
  } catch (error) {
    console.error("Error in fetchLeaguesBySport:", error);
    return getSampleLeaguesForSport(sportType);
  }
};

// Function to get sample leagues for a specific sport
export const getSampleLeaguesForSport = (sportType: SportType): League[] => {
  switch (sportType) {
    case 'football':
      return [
        { id: 'nfl', name: 'NFL', sportType: 'football', active: true, featured: true },
        { id: 'ncaa', name: 'NCAA Football', sportType: 'football', active: true, featured: false }
      ];
    case 'basketball':
      return [
        { id: 'nba', name: 'NBA', sportType: 'basketball', active: true, featured: true },
        { id: 'ncaa-basketball', name: 'NCAA Basketball', sportType: 'basketball', active: true, featured: false }
      ];
    case 'baseball':
      return [
        { id: 'mlb', name: 'MLB', sportType: 'baseball', active: true, featured: true }
      ];
    case 'hockey':
      return [
        { id: 'nhl', name: 'NHL', sportType: 'hockey', active: true, featured: true }
      ];
    case 'soccer':
      return [
        { id: 'premier-league', name: 'Premier League', sportType: 'soccer', active: true, featured: true },
        { id: 'la-liga', name: 'La Liga', sportType: 'soccer', active: true, featured: false }
      ];
    case 'mma':
      return [
        { id: 'ufc', name: 'UFC', sportType: 'mma', active: true, featured: true },
        { id: 'bellator', name: 'Bellator', sportType: 'mma', active: true, featured: false }
      ];
    case 'rugby':
      return [
        { id: 'six-nations', name: 'Six Nations', sportType: 'rugby', active: true, featured: true },
        { id: 'premiership', name: 'Premiership Rugby', sportType: 'rugby', active: true, featured: false }
      ];
    case 'volleyball':
      return [
        { id: 'world-champ', name: 'World Championship', sportType: 'volleyball', active: true, featured: true },
        { id: 'fivb', name: 'FIVB World League', sportType: 'volleyball', active: true, featured: false }
      ];
    case 'formula1':
      return [
        { id: 'f1', name: 'Formula 1', sportType: 'formula1', active: true, featured: true }
      ];
    case 'afl':
      return [
        { id: 'afl-premiership', name: 'AFL Premiership', sportType: 'afl', active: true, featured: true }
      ];
    case 'handball':
      return [
        { id: 'european-champ', name: 'European Championship', sportType: 'handball', active: true, featured: true },
        { id: 'world-champ-handball', name: 'World Championship', sportType: 'handball', active: true, featured: false }
      ];
    default:
      return [];
  }
};

// Function to get sport type from league ID
export const getSportTypeFromLeagueId = (leagueId: string): SportType => {
  switch (leagueId) {
    case 'nfl':
    case 'ncaa':
      return 'football';
    case 'nba':
    case 'ncaa-basketball':
      return 'basketball';
    case 'mlb':
      return 'baseball';
    case 'nhl':
      return 'hockey';
    case 'premier-league':
    case 'la-liga':
      return 'soccer';
    case 'ufc':
    case 'bellator':
      return 'mma';
    case 'six-nations':
    case 'premiership':
      return 'rugby';
    case 'world-champ':
    case 'fivb':
      return 'volleyball';
    case 'f1':
      return 'formula1';
    case 'afl-premiership':
      return 'afl';
    case 'european-champ':
    case 'world-champ-handball':
      return 'handball';
    default:
      return 'football';
  }
};
