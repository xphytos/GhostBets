
import React from 'react';
import { League } from '@/types/betting';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaguesListProps {
  leagues: League[];
  selectedLeague: string | null;
  onSelectLeague: (leagueId: string) => void;
}

export const LeaguesList: React.FC<LeaguesListProps> = ({
  leagues,
  selectedLeague,
  onSelectLeague
}) => {
  // Add debug logging to see what's coming in
  console.log('LeaguesList received leagues:', leagues);
  
  if (!leagues || leagues.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No leagues available for this sport
      </div>
    );
  }

  // Sort leagues to show featured/popular ones first
  const sortedLeagues = [...leagues].sort((a, b) => {
    // Featured leagues first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Then alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-1">
      {sortedLeagues.map((league) => (
        <Button
          key={league.id}
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-normal",
            selectedLeague === league.id && "bg-accent/60"
          )}
          onClick={() => onSelectLeague(league.id)}
        >
          <div className="flex items-center w-full">
            {league.featured ? (
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
            ) : league.country ? (
              <Globe className="mr-2 h-4 w-4 text-blue-500" />
            ) : (
              <Trophy className="mr-2 h-4 w-4 text-primary/70" />
            )}
            <span className="truncate">{league.name}</span>
            {league.country && (
              <span className="ml-auto text-xs text-muted-foreground">{league.country}</span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};
