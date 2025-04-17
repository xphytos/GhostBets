
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveGames } from '@/hooks/useLiveUpdates';
import { LiveGameCard } from './LiveGameCard';
import { Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const LiveGamesSection: React.FC = () => {
  const { liveGames } = useLiveGames();
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Zap size={18} className="text-red-500" />
          Live Games
          {liveGames.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {liveGames.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          {liveGames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No live games at the moment</p>
              <p className="text-sm mt-1">Check back later for live action</p>
            </div>
          ) : (
            <div className="space-y-4">
              {liveGames.map(game => (
                <LiveGameCard key={game.id} gameId={game.id} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
