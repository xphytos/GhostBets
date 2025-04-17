
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fetchGamesBySport, fetchGamesByLeague, fetchLeaguesBySport } from "@/lib/api";
import { SportType, League, Game } from "@/types/betting";
import { GameCard } from "./GameCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Trophy, Lock, AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SportsbookLeaguesProps {
  sportType: SportType;
}

export const SportsbookLeagues: React.FC<SportsbookLeaguesProps> = ({ sportType }) => {
  const { data: leagues, isLoading: isLoadingLeagues } = useQuery({
    queryKey: ['leagues', sportType],
    queryFn: () => fetchLeaguesBySport(sportType),
  });

  if (isLoadingLeagues) {
    return (
      <div className="flex items-center justify-center p-6">
        <p>Loading leagues...</p>
      </div>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Leagues Available</CardTitle>
          <CardDescription>There are no leagues available for this sport at the moment.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-amber-50 text-amber-800 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="flex items-center gap-2">
          <Lock size={14} className="text-amber-500" />
          <span>
            Betting closes 1 hour before the scheduled game time. Closed bets will be visually marked in red.
          </span>
        </AlertDescription>
      </Alert>
      
      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
        <AlertTitle className="flex items-center text-red-700 mb-1">
          <Clock size={16} className="mr-2" /> Important Time Restriction
        </AlertTitle>
        <AlertDescription className="text-red-600 text-sm">
          For your protection, we automatically disable betting 1 hour before game start. 
          Unavailable bets will be marked in red with a lock icon.
        </AlertDescription>
      </div>
      
      <Accordion type="multiple" defaultValue={[leagues?.[0]?.id]}>
        {leagues.map((league) => (
          <AccordionItem key={league.id} value={league.id}>
            <AccordionTrigger className="px-4 py-3 hover:bg-secondary">
              <div className="flex items-center">
                <Trophy size={18} className="mr-2 text-primary" />
                <span>{league.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-2">
              <LeagueGames leagueId={league.id} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

interface LeagueGamesProps {
  leagueId: string;
}

const LeagueGames: React.FC<LeagueGamesProps> = ({ leagueId }) => {
  const { data: games, isLoading } = useQuery({
    queryKey: ['games', leagueId],
    queryFn: () => fetchGamesByLeague(leagueId),
  });

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading games...</div>;
  }

  if (!games || games.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No upcoming games for this league</div>;
  }

  return (
    <div className="space-y-4 px-2">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};
