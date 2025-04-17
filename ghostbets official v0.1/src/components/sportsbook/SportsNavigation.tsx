
import React from 'react';
import { SportType } from '@/types/betting';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { Trophy, CircleDot, Award, Building, Globe } from 'lucide-react';
import { supportedSports } from '@/lib/espn-api/client';

// Map of sports to their icons
const sportIcons = {
  football: <Trophy size={20} />,
  basketball: <CircleDot size={20} />,
  baseball: <Award size={20} />,
  hockey: <Building size={20} />,
  soccer: <Globe size={20} />,
};

// Map of sports to their display names
const sportLabels: Record<SportType, string> = {
  football: 'Football',
  basketball: 'Basketball',
  baseball: 'Baseball',
  hockey: 'Hockey',
  soccer: 'Soccer',
  mma: 'MMA',
  rugby: 'Rugby',
  volleyball: 'Volleyball',
  formula1: 'Formula 1',
  afl: 'AFL',
  handball: 'Handball'
};

// Map of sports to their emoji icons
const sportEmojis: Record<SportType, string> = {
  football: '🏈',
  basketball: '🏀',
  baseball: '⚾',
  hockey: '🏒',
  soccer: '⚽',
  mma: '🥊',
  rugby: '🏉',
  volleyball: '🏐',
  formula1: '🏎️',
  afl: '🏉',
  handball: '🤾'
};

interface SportsNavigationProps {
  currentSport: SportType;
  onSportChange: (sport: SportType) => void;
}

export const SportsNavigation: React.FC<SportsNavigationProps> = ({ currentSport, onSportChange }) => {
  // Only display supported sports that have leagues
  const availableSports = Object.keys(supportedSports)
    .filter(sport => {
      const sportConfig = supportedSports[sport as SportType];
      return sportConfig.id && Object.keys(sportConfig.leagues).length > 0;
    })
    .map(sport => sport as SportType);

  return (
    <div className="overflow-x-auto pb-2">
      <Tabs value={currentSport} onValueChange={(value) => onSportChange(value as SportType)}>
        <TabsList className="h-10 p-1 w-full sm:w-auto whitespace-nowrap">
          {availableSports.map((sport) => (
            <TabsTrigger
              key={sport}
              value={sport}
              className={cn(
                "h-8 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", 
                { "bg-primary/5": currentSport === sport }
              )}
            >
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block">{sportEmojis[sport]}</span>
                {sportIcons[sport] || <Trophy size={20} />}
                <span>{sportLabels[sport]}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export { sportLabels, sportEmojis };
