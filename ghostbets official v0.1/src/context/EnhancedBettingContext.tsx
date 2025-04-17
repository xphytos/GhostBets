
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserBet, BetSlip } from '@/types/betting';
import { toast } from 'sonner';
import { fetchUserBets } from '@/lib/api';
import { placeBet } from '@/lib/betting/user-bets';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface EnhancedBettingContextType {
  betSlip: BetSlip;
  addToBetSlip: (bet: UserBet) => void;
  removeFromBetSlip: (betId: string) => void;
  clearBetSlip: () => void;
  updateStake: (betId: string, stake: number) => void;
  placeBets: () => Promise<void>;
  activeBets: UserBet[];
  settledBets: UserBet[];
  isProcessing: boolean;
  betError: string | null;
  refreshBets: () => Promise<void>;
  fetchUserBetsOnly: () => Promise<void>;
  isRefreshing: boolean;
}

const EnhancedBettingContext = createContext<EnhancedBettingContextType | undefined>(undefined);

export const useEnhancedBetting = () => {
  const context = useContext(EnhancedBettingContext);
  
  if (context === undefined) {
    throw new Error('useEnhancedBetting must be used within an EnhancedBettingProvider');
  }
  
  return context;
};

interface EnhancedBettingProviderProps {
  children: ReactNode;
}

export const EnhancedBettingProvider: React.FC<EnhancedBettingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [betSlip, setBetSlip] = useState<BetSlip>({
    bets: [],
    totalStake: 0,
    potentialWinnings: 0,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // More efficient fetch user bets query with React Query
  const { 
    data: userBets = [], 
    isLoading 
  } = useQuery({
    queryKey: ['user-bets', user?.id],
    queryFn: fetchUserBets,
    enabled: !!user,
    // Add staleTime to prevent unnecessary refetches
    staleTime: 300000, // 5 minutes
    // Add cache time for better performance
    gcTime: 600000, // 10 minutes
    // Add additional options to improve stability
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  
  // Split bets into active and settled - memoized for performance
  const activeBets = userBets.filter(bet => bet.status === 'open');
  const settledBets = userBets.filter(bet => bet.status === 'settled');
  
  // Function to only fetch user bets without any other data
  const fetchUserBetsOnly = useCallback(async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['user-bets', user.id] });
    } catch (error) {
      console.error("Error fetching user bets:", error);
      toast.error("Failed to fetch your bets. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [user, queryClient, isRefreshing]);
  
  // Debounced refresh function to prevent multiple rapid calls
  const refreshBets = useCallback(async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['user-bets', user.id] });
    } catch (error) {
      console.error("Error refreshing bets:", error);
      toast.error("Failed to refresh bets. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [user, queryClient, isRefreshing]);
  
  // Listen for auth changes to clear bet slip on logout
  useEffect(() => {
    if (!user) {
      clearBetSlip();
    }
  }, [user]);
  
  // Listen for real-time bet updates, but only when the user is looking at their bets
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('bets_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bets', filter: `user_id=eq.${user.id}` },
        () => {
          refreshBets();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshBets]);
  
  const calculatePotentialWinnings = (odds: number, stake: number): number => {
    if (odds > 0) {
      return (odds / 100) * stake + stake;
    } else {
      return (100 / Math.abs(odds)) * stake + stake;
    }
  };
  
  const recalculateTotals = (bets: UserBet[]): BetSlip => {
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const potentialWinnings = bets.reduce((sum, bet) => sum + bet.potentialWinnings, 0);
    
    return {
      bets,
      totalStake,
      potentialWinnings,
    };
  };
  
  const addToBetSlip = (bet: UserBet) => {
    setBetError(null);
    setBetSlip((prev) => {
      // Check if the bet is already in the slip
      if (prev.bets.some((b) => b.id === bet.id)) {
        toast.error('This bet is already in your slip');
        return prev;
      }
      
      // Check if user has already bet on this game with this bet type
      if (userBets.some(b => b.gameId === bet.gameId && b.betType === bet.betType && b.status === 'open')) {
        toast.error(`You've already placed a ${bet.betType} bet on this game`);
        return prev;
      }
      
      // Generate a unique ID for the bet
      const betWithId = {
        ...bet,
        id: uuidv4() // Use UUID v4 to generate a proper UUID
      };
      
      const newBets = [...prev.bets, betWithId];
      toast.success('Bet added to slip');
      return recalculateTotals(newBets);
    });
  };
  
  const removeFromBetSlip = (betId: string) => {
    setBetError(null);
    setBetSlip((prev) => {
      const newBets = prev.bets.filter((bet) => bet.id !== betId);
      toast.info('Bet removed from slip');
      return recalculateTotals(newBets);
    });
  };
  
  const clearBetSlip = () => {
    setBetError(null);
    setBetSlip({
      bets: [],
      totalStake: 0,
      potentialWinnings: 0,
    });
    toast.info('Bet slip cleared');
  };
  
  const updateStake = (betId: string, stake: number) => {
    setBetError(null);
    setBetSlip((prev) => {
      const newBets = prev.bets.map((bet) => {
        if (bet.id === betId) {
          const potentialWinnings = calculatePotentialWinnings(bet.odds, stake);
          return { ...bet, stake, potentialWinnings };
        }
        return bet;
      });
      
      return recalculateTotals(newBets);
    });
  };
  
  const placeBets = async () => {
    if (!user) {
      setBetError('You must be logged in to place bets');
      toast.error('You must be logged in to place bets');
      return;
    }
    
    if (betSlip.bets.length === 0) {
      setBetError('Your bet slip is empty');
      toast.error('Your bet slip is empty');
      return;
    }
    
    try {
      setIsProcessing(true);
      setBetError(null);
      
      // Get the current user's real UUID from auth
      const userId = user.id;
      
      // Place each bet with the proper user ID from auth
      for (const bet of betSlip.bets) {
        const betWithUserId = {
          ...bet,
          userId: userId // Use the actual user ID from auth
        };
        
        // Use the placeBet function from user-bets.ts which now checks for profiles
        const result = await placeBet(betWithUserId);
        
        if (!result.success) {
          setBetError(result.message);
          throw new Error(result.message);
        }
      }
      
      // Clear the bet slip after placing bets
      clearBetSlip();
      toast.success('Bets placed successfully!');
      
      // Refetch user bets to update the UI
      fetchUserBetsOnly();
      
    } catch (error) {
      console.error('Error placing bets:', error);
      toast.error(`Failed to place bets: ${error.message}`);
      setBetError(`Failed to place bets: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const value: EnhancedBettingContextType = {
    betSlip,
    addToBetSlip,
    removeFromBetSlip,
    clearBetSlip,
    updateStake,
    placeBets,
    activeBets,
    settledBets,
    isProcessing,
    betError,
    refreshBets,
    fetchUserBetsOnly,
    isRefreshing: isRefreshing || isLoading,
  };
  
  return (
    <EnhancedBettingContext.Provider value={value}>
      {children}
    </EnhancedBettingContext.Provider>
  );
};
