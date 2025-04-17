
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, CreditCard, BarChart, ClipboardList } from 'lucide-react';
import { ActiveBetsTable } from './ActiveBetsTable';
import { useEnhancedBetting } from '@/context/EnhancedBettingContext';

export const LiveBettingDashboard: React.FC = () => {
  const { activeBets, settledBets } = useEnhancedBetting();
  
  // Calculate overall stats
  const totalStaked = [...activeBets, ...settledBets].reduce((sum, bet) => sum + bet.stake, 0);
  const totalWinnings = settledBets
    .filter(bet => bet.result === 'win')
    .reduce((sum, bet) => sum + bet.potentialWinnings, 0);
  const netProfit = totalWinnings - totalStaked;
  const winRate = settledBets.length > 0
    ? (settledBets.filter(bet => bet.result === 'win').length / settledBets.length) * 100
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBets.length}</div>
            <p className="text-xs text-muted-foreground">
              Bets awaiting settlement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStaked.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all bets
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <BarChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Win/loss balance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Based on settled bets
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Bets</TabsTrigger>
          <TabsTrigger value="settled">Settled Bets</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <ActiveBetsTable bets={activeBets} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="settled" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <ActiveBetsTable bets={settledBets} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
