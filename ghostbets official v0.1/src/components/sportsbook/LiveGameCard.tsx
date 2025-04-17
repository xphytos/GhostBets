
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Info, ChevronDown, ChevronUp, DollarSign, AlertCircle } from "lucide-react";
import { useLiveGame } from "@/hooks/useLiveUpdates";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fetchBettingLines } from "@/lib/betting/bet-lines";
import { Link } from "react-router-dom";
import { BetLine, BetStatus } from "@/types/betting";
import { useEnhancedBetting } from "@/context/EnhancedBettingContext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/context/AuthContext';

interface LiveGameCardProps {
  gameId: string;
}

export const LiveGameCard: React.FC<LiveGameCardProps> = ({ gameId }) => {
  const { game, isLive } = useLiveGame({ gameId });
  const [bettingLines, setBettingLines] = useState<BetLine[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToBetSlip } = useEnhancedBetting();
  const { user } = useAuth();
  
  // Fetch betting lines when component mounts
  useEffect(() => {
    const fetchLines = async () => {
      try {
        setLoading(true);
        const lines = await fetchBettingLines(gameId);
        setBettingLines(lines);
      } catch (error) {
        console.error('Error fetching betting lines:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLines();
  }, [gameId]);
  
  if (!game) {
    return null;
  }
  
  const formattedDate = format(new Date(game.startTime), "EEE, MMM d • h:mm a");
  
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
      id: `${gameId}-${betType}-${selection}-${Date.now()}`,
      userId: user?.id || 'anonymous', // Add userId property
      gameId: gameId,
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
    <Card className={cn(
      "w-full overflow-hidden transition-all duration-200",
      isLive ? "border-red-500 shadow-md" : "border-zinc-200"
    )}>
      <div className="px-4 py-3 flex justify-between items-center border-b">
        <div className="flex items-center">
          {isLive ? (
            <div className="flex items-center">
              <Zap size={16} className="text-red-500 mr-1.5 animate-pulse" />
              <span className="text-sm font-medium text-red-500">LIVE</span>
              {game.timeRemaining && (
                <Badge variant="outline" className="ml-2 text-xs border-red-200">
                  {game.quarter && `Q${game.quarter}`} {game.timeRemaining}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <Clock size={14} className="text-muted-foreground mr-1.5" />
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>
          )}
        </div>
        
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

      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-3">
          {/* Away Team */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="font-medium">{game.awayTeam.name}</span>
              {game.awayTeam.record && (
                <span className="text-xs text-muted-foreground">({game.awayTeam.record})</span>
              )}
              {game.score && (
                <span className={cn(
                  "font-bold text-xl ml-2 transition-all", 
                  isLive && "text-red-500"
                )}>
                  {game.score.away}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {loading ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
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
          
          {/* Middle section with O/U */}
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
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 mb-2">
              {game.score && (
                <span className={cn(
                  "font-bold text-xl mr-2 transition-all", 
                  isLive && "text-red-500"
                )}>
                  {game.score.home}
                </span>
              )}
              <span className="font-medium">{game.homeTeam.name}</span>
              {game.homeTeam.record && (
                <span className="text-xs text-muted-foreground">({game.homeTeam.record})</span>
              )}
            </div>
            <div className="flex gap-2">
              {loading ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
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
        
        <div className="flex justify-between mt-4">
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
