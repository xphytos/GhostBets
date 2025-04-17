
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface RewardTransaction {
  userId: string;
  type: 'daily_reward' | 'streak_bonus' | 'other';
  amount: number;
  description?: string;
}

export const logRewardTransaction = async (transaction: RewardTransaction): Promise<boolean> => {
  try {
    // Get current balance first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', transaction.userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile balance:', profileError);
      return false;
    }
    
    const balanceBefore = typeof profileData.balance === 'number' 
      ? profileData.balance 
      : parseFloat(profileData.balance as any) || 0;
      
    const balanceAfter = balanceBefore + transaction.amount;
    
    console.log("Transaction calculation:", {
      balanceBefore,
      amount: transaction.amount,
      balanceAfter
    });
    
    // Update the balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        balance: balanceAfter,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.userId);
      
    if (updateError) {
      console.error('Error updating balance:', updateError);
      return false;
    }
    
    // Log the transaction to console for debugging
    console.log('Transaction completed:', {
      user_id: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: transaction.description || `Reward: ${transaction.type}`
    });
    
    return true;
  } catch (error) {
    console.error('Error in logRewardTransaction:', error);
    return false;
  }
};

export const claimDailyReward = async (userId: string, baseReward: number, streakDays: number): Promise<{
  success: boolean;
  newBalance?: number;
  newStreakDays?: number;
  error?: string;
}> => {
  try {
    if (!userId) {
      console.error('No user ID provided to claimDailyReward');
      return { success: false, error: 'Authentication required. Please log in.' };
    }

    const streakBonus = Math.floor(streakDays / 5) * 2;
    const totalReward = baseReward + streakBonus;
    const now = new Date().toISOString();
    
    console.log(`Attempting to claim reward for user ${userId} with streak ${streakDays}`);
    
    // Fetch current user data
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('balance, streak_days, last_reward_claim')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return { success: false, error: `Database error: ${fetchError.message}` };
    }
    
    if (!profile) {
      console.error('User profile not found:', userId);
      return { success: false, error: 'User profile not found. Please log in again.' };
    }
    
    // Check if already claimed today
    const lastClaimDate = profile.last_reward_claim ? new Date(profile.last_reward_claim) : null;
    const today = new Date();
    
    if (lastClaimDate && 
        lastClaimDate.getDate() === today.getDate() &&
        lastClaimDate.getMonth() === today.getMonth() &&
        lastClaimDate.getFullYear() === today.getFullYear()) {
      console.log('User already claimed reward today:', {
        userId,
        lastClaimDate: lastClaimDate.toISOString(),
        today: today.toISOString()
      });
      return { 
        success: false,
        newBalance: profile.balance,
        newStreakDays: profile.streak_days,
        error: 'Already claimed today'
      };
    }
    
    // Calculate new streak days
    let newStreakDays = (profile.streak_days || 0) + 1;
    
    if (lastClaimDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last claim wasn't yesterday, reset streak
      if (lastClaimDate.getDate() !== yesterday.getDate() ||
          lastClaimDate.getMonth() !== yesterday.getMonth() ||
          lastClaimDate.getFullYear() !== yesterday.getFullYear()) {
        newStreakDays = 1; // Reset streak but count today
        console.log('Streak reset - last claim was not yesterday');
      }
    }
    
    // Ensure balance is a proper number
    const currentBalance = typeof profile.balance === 'number' 
      ? profile.balance 
      : parseFloat(profile.balance as any) || 0;
      
    const newBalance = currentBalance + totalReward;
    
    console.log("Reward calculation:", {
      currentBalance,
      baseReward,
      streakBonus,
      totalReward,
      newBalance
    });
    
    // Update streak days, last claim date, AND balance all in one transaction
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak_days: newStreakDays,
        last_reward_claim: now,
        balance: newBalance,
        updated_at: now
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating profile with reward:', updateError);
      return { success: false, error: `Update error: ${updateError.message}` };
    }
    
    // Log the transaction (this doesn't affect database but helps with debugging)
    console.log('Daily reward claimed:', {
      user_id: userId,
      type: 'daily_reward',
      amount: totalReward,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: `Daily reward (${baseReward}) + Streak bonus (${streakBonus})`,
      new_streak_days: newStreakDays
    });
    
    return {
      success: true,
      newBalance: newBalance,
      newStreakDays
    };
  } catch (error) {
    console.error('Error in claimDailyReward:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
