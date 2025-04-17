
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Game } from '@/types/betting';

interface EventCardProps {
  id: string | number;
  title: string;
  teams: string;
  time: string;
  featured?: boolean;
  live?: boolean;
  gameObject?: Game;
}

export const EnhancedEventCard: React.FC<EventCardProps> = ({ 
  id, 
  title, 
  teams, 
  time, 
  featured = false, 
  live = false,
  gameObject
}) => {
  // Extract sport emoji based on title
  const getSportEmoji = (title: string): string => {
    const sportMap: Record<string, string> = {
      'NFL': '🏈',
      'NBA': '🏀',
      'MLB': '⚾',
      'NHL': '🏒',
      'Premier League': '⚽',
      'La Liga': '⚽',
      'Tennis': '🎾',
      'UFC': '🥊',
      'Golf': '⛳',
      'F1': '🏎️'
    };
    
    // Check for partial matches if no exact match
    for (const [key, emoji] of Object.entries(sportMap)) {
      if (title.includes(key)) return emoji;
    }
    
    return '🏆'; // Default emoji
  };

  const sportEmoji = getSportEmoji(title);
  
  return (
    <Card className={cn(
      "ghost-card hover:bg-secondary/80 transition-colors overflow-hidden",
      featured && "border-accent/50"
    )}>
      {featured && (
        <div className="bg-accent text-accent-foreground text-xs px-3 py-1 flex items-center justify-center gap-1">
          <Star size={12} /> Featured Event
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">
            <span className="mr-2">{sportEmoji}</span>
            {title}
          </CardTitle>
          {live && (
            <span className="flex items-center gap-1 text-xs bg-destructive/20 text-destructive py-0.5 px-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              Live
            </span>
          )}
        </div>
        <CardDescription className="text-sm">{teams}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={14} />
            <span>{time}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link to={`/sportsbook/${id}`}>
            View Game
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
