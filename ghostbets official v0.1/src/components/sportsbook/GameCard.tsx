
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Game, BetLine, BetStatus } from '@/types/betting';
import { Calendar, Info, ChevronDown, ChevronUp, DollarSign, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchBettingLines } from '@/lib/betting/bet-lines';
import { useEnhancedBetting } from '@/context/EnhancedBettingContext';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/context/AuthContext';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  // Format the game date and time
  const gameDate = new Date(game.startTime);
  const formattedTime = gameDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  
  // State for betting lines
  const [bettingLines, setBettingLines] = useState<BetLine[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToBetSlip } = useEnhancedBetting();
  const { user } = useAuth();
  
  // Fetch betting lines when component mounts
  useEffect(() => {
    const fetchLines = async () => {
      try {
        setLoading(true);
        const lines = await fetchBettingLines(game.id);
        setBettingLines(lines);
        console.log('Betting lines:', lines);
      } catch (error) {
        console.error('Error fetching betting lines:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLines();
  }, [game.id]);
  
  // Extract betting data
  const spreadsData = bettingLines.find(line => line.type === 'spreads');
  const moneylineData = bettingLines.find(line => line.type === 'moneyline');
  const totalsData = bettingLines.find(line => line.type === 'totals');
  
  // Check if any lines are generated
  const hasGeneratedLines = bettingLines.some(line => line.isGenerated);
  
  // Format odds for display
  const formatOdds = (odds: number) => {
    if (!odds) return '';
    return odds > 0 ? `+${odds}` : `${odds}`;
  };
  
  // Format spread for display
  const formatSpread = (spread: number) => {
    if (!spread) return '';
    return spread > 0 ? `+${spread}` : `${spread}`;
  };
  
  // Handle bet click - create a bet and add to bet slip
  const handleBetClick = (betType: string, selection: string, odds: number) => {
    if (!odds) {
      toast.error("No odds available for this selection");
      return;
    }
    
    // Create the bet object
    const bet = {
      id: `${game.id}-${betType}-${selection}-${Date.now()}`,
      userId: user?.id || 'anonymous', // Add userId property
      gameId: game.id,
      betType: betType,
      selection: selection,
      odds: odds,
      homeTeam: game.homeTeam.name,
      awayTeam: game.awayTeam.name,
      stake: 10, // Default stake
      potentialWinnings: calculatePotentialWinnings(odds, 10),
      status: 'open' as BetStatus, // Explicitly cast to BetStatus type
      teams: {
        home: game.homeTeam.name,
        away: game.awayTeam.name
      },
      createdAt: new Date().toISOString()
    };
    
    // Add to bet slip
    addToBetSlip(bet);
  };
  
  // Calculate potential winnings
  const calculatePotentialWinnings = (odds: number, stake: number): number => {
    if (odds > 0) {
      return (odds / 100) * stake + stake;
    } else {
      return (100 / Math.abs(odds)) * stake + stake;
    }
  };
  
  return (
    <Card className="w-full border transition-colors hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar size={14} />
            {gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {formattedTime}
          </span>
          
          {hasGeneratedLines && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-amber-500 font-medium">
                    <AlertCircle size={14} className="mr-1" />
                    <span>Generated Lines</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-amber-50 border-amber-200 text-amber-800">
                  <p>Betting lines for this game are generated to create a realistic user experience. These odds were created algorithmically to match the teams and sport.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Away Team */}
            <div className="flex flex-col items-start justify-center">
              <div className="font-medium text-left mb-2">{game.awayTeam.name}</div>
              <div className="flex gap-2">
                {loading ? (
                  <div className="text-xs text-muted-foreground">Loading odds...</div>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex items-center gap-1"
                      onClick={() => handleBetClick('spread', 'away', spreadsData?.awaySpreadOdds || 0)}
                    >
                      <ChevronDown size={14} />
                      {spreadsData ? formatSpread(spreadsData.awaySpread) : 'N/A'} {spreadsData ? formatOdds(spreadsData.awaySpreadOdds) : ''}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex items-center gap-1"
                      onClick={() => handleBetClick('moneyline', 'away', moneylineData?.awayOdds || 0)}
                    >
                      <DollarSign size={14} />
                      {moneylineData ? formatOdds(moneylineData.awayOdds) : 'N/A'}
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* VS with Over/Under */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-muted-foreground mb-1">VS</span>
              {loading ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
              ) : (
                <>
                  {totalsData && (
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">O/U</span>
                      <span className="text-sm font-medium">{totalsData.total}</span>
                      <div className="flex gap-1 text-xs">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 px-2 text-xs flex items-center"
                          onClick={() => handleBetClick('total', 'over', totalsData?.overOdds || 0)}
                        >
                          <ChevronUp size={12} /> {formatOdds(totalsData.overOdds)}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 px-2 text-xs flex items-center"
                          onClick={() => handleBetClick('total', 'under', totalsData?.underOdds || 0)}
                        >
                          <ChevronDown size={12} /> {formatOdds(totalsData.underOdds)}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Home Team */}
            <div className="flex flex-col items-end justify-center">
              <div className="font-medium text-right mb-2">{game.homeTeam.name}</div>
              <div className="flex gap-2">
                {loading ? (
                  <div className="text-xs text-muted-foreground">Loading odds...</div>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex items-center gap-1"
                      onClick={() => handleBetClick('moneyline', 'home', moneylineData?.homeOdds || 0)}
                    >
                      <DollarSign size={14} />
                      {moneylineData ? formatOdds(moneylineData.homeOdds) : 'N/A'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex items-center gap-1"
                      onClick={() => handleBetClick('spread', 'home', spreadsData?.homeSpreadOdds || 0)}
                    >
                      <ChevronUp size={14} />
                      {spreadsData ? formatSpread(spreadsData.homeSpread) : 'N/A'} {spreadsData ? formatOdds(spreadsData.homeSpreadOdds) : ''}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {game.location && (
              <div className="flex items-center gap-1">
                <Info size={14} />
                <span>{game.location}</span>
              </div>
            )}
          </div>
          <Button variant="default" size="sm" asChild>
            <Link to={`/sportsbook/${game.id}`}>
              View Game
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
