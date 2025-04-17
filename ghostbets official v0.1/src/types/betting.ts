
export interface League {
  id: string;
  name: string;
  sportType: SportType;
  country?: string;
  logo?: string;
  active: boolean;
  featured: boolean;
  icon?: string;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  leagueId: string;
  logo?: string;
  location?: string;
  colorMain: string;
  colorSecondary: string;
  record?: string;
  mascot?: string;
  stats?: any;
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';
  leagueId: string;
  location?: string;
  broadcasters: string[];
  score?: {
    home: number;
    away: number;
  };
  weather?: {
    temperature: number;
    condition: string;
    windSpeed: number;
  };
  userBets: Set<string>;
  timeRemaining?: string;
  quarter?: number;
  attendance?: number;
}

// Updated BetLine interface to represent various types of betting lines
export interface BetLine {
  type: 'spreads' | 'moneyline' | 'totals' | string;
  homeTeam?: string;
  awayTeam?: string;
  homeSpread?: number;
  awaySpread?: number;
  homeSpreadOdds?: number;
  awaySpreadOdds?: number;
  homeOdds?: number;
  awayOdds?: number;
  drawOdds?: number; // For soccer and other sports that have draws
  total?: number;
  overOdds?: number;
  underOdds?: number;
  updatedAt?: string;
  id?: string;
  gameId?: string;
  spread?: number;
  isGenerated?: boolean; // Flag to indicate if odds were generated instead of real
  
  // Additional properties for the Odds API
  sport_key?: string;
  sport_title?: string;
  commence_time?: string;
  home_team?: string;
  away_team?: string;
  bookmakers?: any[];
  last_update?: string;
  markets?: any[];
  outcomes?: any[];
}

// Simplified betting types without the details
export type BetType = 'generic';

export interface BetSlip {
  bets: UserBet[];
  totalStake: number;
  potentialWinnings: number;
}

export interface UserBet {
  id: string;
  userId: string;
  gameId: string;
  status: BetStatus;
  teams?: {
    home: string;
    away: string;
  };
  score?: {
    home: number;
    away: number;
  };
  [key: string]: any; // Allow additional properties for backward compatibility
}

export type BetStatus = 'open' | 'settled' | 'cancelled' | 'cashout' | 'pending' | 'won' | 'lost' | 'refunded';

// Sport types available in the app
export type SportType = 
  | 'football' 
  | 'basketball' 
  | 'baseball' 
  | 'hockey' 
  | 'soccer'
  | 'mma'
  | 'rugby'
  | 'volleyball'
  | 'formula1'
  | 'afl'
  | 'handball';

// Interface for Odds API response
export interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiMarket {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

export interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}
