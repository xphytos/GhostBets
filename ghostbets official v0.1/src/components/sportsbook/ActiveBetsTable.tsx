
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserBet } from '@/types/betting';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ActiveBetsTableProps {
  bets: UserBet[];
  isLoading?: boolean;
}

export const ActiveBetsTable: React.FC<ActiveBetsTableProps> = ({ bets, isLoading = false }) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading your bets...</div>;
  }

  if (!bets || bets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No bets found</div>;
  }

  return (
    <Table>
      <TableCaption>A list of your bets.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Game</TableHead>
          <TableHead>Bet Type</TableHead>
          <TableHead>Selection</TableHead>
          <TableHead>Odds</TableHead>
          <TableHead>Stake</TableHead>
          <TableHead>Potential Winnings</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bets.map((bet) => (
          <TableRow key={bet.id}>
            <TableCell>{bet.teams?.home} vs {bet.teams?.away}</TableCell>
            <TableCell>{bet.betType}</TableCell>
            <TableCell>{bet.selection}</TableCell>
            <TableCell>{bet.odds}</TableCell>
            <TableCell>{formatCurrency(bet.stake)}</TableCell>
            <TableCell>{formatCurrency(bet.potentialWinnings)}</TableCell>
            <TableCell>
              {bet.status === 'open' && <Badge variant="secondary">Open</Badge>}
              {bet.status === 'settled' && bet.result === 'win' && (
                <Badge variant="default" className="bg-green-500 text-white">
                  Won
                </Badge>
              )}
              {bet.status === 'settled' && bet.result === 'loss' && <Badge variant="destructive">Lost</Badge>}
              {bet.status === 'cancelled' && <Badge>Cancelled</Badge>}
              {bet.status === 'cashout' && <Badge variant="outline">Cashout</Badge>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
