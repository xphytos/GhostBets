
import { UserBet, BetType, BetStatus } from "@/types/betting";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Function to get user's balance
export const getUserBalance = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .maybeSingle();
      
    if (error) throw error;
    
    return data?.balance || 15; // Default is now 15
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return 15; // Default balance
  }
};

// Function to ensure user profile exists
const ensureUserProfileExists = async (userId: string): Promise<boolean> => {
  try {
    // Check if profile exists
    const { data: profile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking profile:", checkError);
      return false;
    }

    // If profile exists, return true
    if (profile) {
      return true;
    }

    // If profile doesn't exist, create it
    console.log("Creating profile for user:", userId);
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: `user_${userId.substring(0, 8)}`, // Generate a simple username
        balance: 15, // Default starting balance
        streak_days: 0,  // Initialize streak days
        last_reward_claim: null // No rewards claimed yet
      });

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in ensureUserProfileExists:", error);
    return false;
  }
};

// Function to fetch user bets from the database
export const fetchUserBets = async (): Promise<UserBet[]> => {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Error getting auth user:", authError);
      return [];
    }

    // Fetch user bets
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .order('placed_at', { ascending: false })
      .returns<any[]>();

    if (error) {
      console.error("Error fetching user bets:", error);
      return [];
    }

    // Convert the database records to UserBet objects
    return (data || []).map(bet => ({
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
      isParlay: bet.is_parlay || false,
      cashoutValue: bet.cashout_value,
      cashoutAvailable: bet.cashout_available || false
    }));
  } catch (error) {
    console.error("Error in fetchUserBets:", error);
    return [];
  }
};

export const placeBet = async (bet: UserBet): Promise<{ success: boolean; message: string; bet?: UserBet }> => {
  try {
    // Check if we have a valid user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: 'You must be logged in to place bets' };
    }
    
    // Ensure user profile exists before proceeding
    const profileExists = await ensureUserProfileExists(user.id);
    if (!profileExists) {
      return { success: false, message: 'Unable to create or verify user profile' };
    }
    
    // Check if the user has sufficient balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .maybeSingle();
      
    if (profileError || !profile) {
      return { success: false, message: 'Error accessing user profile' };
    }
    
    if (profile.balance < bet.stake) {
      return { success: false, message: 'Insufficient balance to place this bet' };
    }
    
    // Create a database insert object that matches the expected structure
    const dbBet: any = {
      user_id: user.id, // Use the authenticated user's ID
      game_id: bet.gameId,
      bet_type: bet.betType,
      selection: bet.selection,
      odds: bet.odds,
      stake: bet.stake,
      potential_winnings: bet.potentialWinnings,
      status: 'open' as BetStatus,
      placed_at: new Date().toISOString(),
      teams: bet.teams,
      score: bet.score,
      parlay_id: bet.parlayId,
      is_parlay: bet.isParlay || false,
      cashout_available: true,
      cashout_value: bet.stake * 0.8 // 80% of stake for immediate cashout
    };
    
    // Insert the bet into the database
    const { data: betData, error: betError } = await supabase
      .from('bets')
      .insert(dbBet)
      .select('*')
      .single();
      
    if (betError) {
      console.error('Error placing bet:', betError);
      return { success: false, message: betError.message };
    }
    
    // Update user balance
    const newBalance = profile.balance - bet.stake;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Error updating balance:', updateError);
      // Don't return error here, bet is already placed
    }
    
    // Create a UserBet object to return
    const userBet: UserBet = {
      id: betData.id,
      userId: betData.user_id,
      gameId: betData.game_id,
      betType: betData.bet_type as BetType,
      selection: betData.selection as 'home' | 'away' | 'over' | 'under' | 'draw',
      odds: betData.odds,
      stake: betData.stake,
      potentialWinnings: betData.potential_winnings,
      status: betData.status as BetStatus,
      placedAt: betData.placed_at,
      settledAt: betData.settled_at,
      result: betData.result as 'win' | 'loss' | 'push' | undefined,
      teams: betData.teams as { home: string; away: string } | undefined,
      score: betData.score as { home: number; away: number } | undefined,
      parlayId: betData.parlay_id,
      isParlay: betData.is_parlay || false,
      cashoutValue: betData.cashout_value,
      cashoutAvailable: betData.cashout_available || false
    };
    
    return { success: true, message: 'Bet placed successfully', bet: userBet };
    
  } catch (error) {
    console.error('Error in placeBet:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};
