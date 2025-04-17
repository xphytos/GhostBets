
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEnhancedBetting } from '@/context/EnhancedBettingContext';
import { formatOdds } from '@/lib/utils';
import { Trash2, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BetSlipDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const BetSlipDrawer: React.FC<BetSlipDrawerProps> = ({ open, onClose }) => {
  const { betSlip, removeFromBetSlip, updateStake, clearBetSlip, placeBets, isProcessing, betError } = useEnhancedBetting();
  const { user } = useAuth();
  
  const handleStakeChange = (betId: string, value: string) => {
    const stake = parseFloat(value);
    if (!isNaN(stake) && stake >= 0) {
      updateStake(betId, stake);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Bet Slip</SheetTitle>
          <SheetDescription>
            {betSlip.bets.length === 0 
              ? "Your bet slip is empty" 
              : `${betSlip.bets.length} bet${betSlip.bets.length !== 1 ? 's' : ''} in your slip`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 mt-4">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Betting closes 1 hour before the scheduled game time.
            </AlertDescription>
          </Alert>

          {betError && (
            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {betError}
              </AlertDescription>
            </Alert>
          )}
          
          {betSlip.bets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bets added yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Browse games and select odds to add bets to your slip
              </p>
            </div>
          ) : (
            <>
              {/* List of bets */}
              <div className="space-y-3">
                {betSlip.bets.map((bet) => (
                  <Card key={bet.id} className="p-3 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={() => removeFromBetSlip(bet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="mb-2">
                      <div className="font-medium">{bet.teams?.away} @ {bet.teams?.home}</div>
                      <div className="text-sm text-muted-foreground">
                        {bet.betType === 'moneyline' ? 'Moneyline' : bet.betType === 'spread' ? 'Spread' : 'Total'} • {
                          bet.selection === 'home' ? bet.teams?.home :
                          bet.selection === 'away' ? bet.teams?.away :
                          bet.selection === 'over' ? 'Over' : 'Under'
                        }
                      </div>
                      <div className="text-sm font-medium mt-1">Odds: {formatOdds(bet.odds)}</div>
                    </div>
                    
                    <div className="flex items-center mt-3">
                      <div className="flex-1">
                        <label htmlFor={`stake-${bet.id}`} className="text-xs text-muted-foreground">
                          Stake ($)
                        </label>
                        <Input
                          id={`stake-${bet.id}`}
                          type="number"
                          min="1"
                          className="mt-1"
                          value={bet.stake.toString()}
                          onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                        />
                      </div>
                      <div className="ml-3 text-right">
                        <div className="text-xs text-muted-foreground">To Win</div>
                        <div className="font-medium">${bet.potentialWinnings.toFixed(2)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <Separator />
              
              {/* Summary and actions */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Stake:</span>
                  <span className="font-medium">${betSlip.totalStake.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Potential Winnings:</span>
                  <span className="font-medium">${betSlip.potentialWinnings.toFixed(2)}</span>
                </div>
                
                <div className="pt-2 space-y-2">
                  <Button 
                    className="w-full" 
                    disabled={betSlip.bets.length === 0 || isProcessing || !user}
                    onClick={placeBets}
                  >
                    {isProcessing ? "Processing..." : "Place Bets"}
                  </Button>
                  
                  {!user && (
                    <div className="text-xs text-destructive text-center">
                      Please log in to place bets
                    </div>
                  )}
                  
                  <Button
                    variant="outline" 
                    className="w-full"
                    onClick={clearBetSlip}
                    disabled={betSlip.bets.length === 0 || isProcessing}
                  >
                    Clear Slip
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
