
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserBet, BetSlip } from '@/types/betting';
import { toast } from 'sonner';

interface BettingContextType {
  betSlip: BetSlip;
  addToBetSlip: (bet: UserBet) => void;
  removeFromBetSlip: (betId: string) => void;
  clearBetSlip: () => void;
  updateStake: (betId: string, stake: number) => void;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export const useBetting = () => {
  const context = useContext(BettingContext);
  
  if (context === undefined) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  
  return context;
};

interface BettingProviderProps {
  children: ReactNode;
}

export const BettingProvider: React.FC<BettingProviderProps> = ({ children }) => {
  const [betSlip, setBetSlip] = useState<BetSlip>({
    bets: [],
    totalStake: 0,
    potentialWinnings: 0,
  });
  
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
    setBetSlip((prev) => {
      // Check if the bet is already in the slip
      if (prev.bets.some((b) => b.id === bet.id)) {
        toast.error('This bet is already in your slip');
        return prev;
      }
      
      const newBets = [...prev.bets, bet];
      toast.success('Bet added to slip');
      return recalculateTotals(newBets);
    });
  };
  
  const removeFromBetSlip = (betId: string) => {
    setBetSlip((prev) => {
      const newBets = prev.bets.filter((bet) => bet.id !== betId);
      toast.info('Bet removed from slip');
      return recalculateTotals(newBets);
    });
  };
  
  const clearBetSlip = () => {
    setBetSlip({
      bets: [],
      totalStake: 0,
      potentialWinnings: 0,
    });
    toast.info('Bet slip cleared');
  };
  
  const updateStake = (betId: string, stake: number) => {
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
  
  const value: BettingContextType = {
    betSlip,
    addToBetSlip,
    removeFromBetSlip,
    clearBetSlip,
    updateStake,
  };
  
  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  );
};
