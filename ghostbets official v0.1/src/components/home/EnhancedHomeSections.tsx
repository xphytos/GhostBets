
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, ChevronRight, Zap, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomePageData } from '@/hooks/useHomePageData';
import { EnhancedEventCard } from './EnhancedEventCard';

export const EnhancedHomeSections: React.FC = () => {
  const { 
    popularGames, 
    liveGames, 
    upcomingGames, 
    leagues, 
    isLoading 
  } = useHomePageData();

  return (
    <div className="space-y-8">
      {/* Tabs for Popular/Live/Upcoming */}
      <section>
        <Tabs defaultValue="popular">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="live">
                Live Now
                {liveGames.length > 0 && (
                  <span className="ml-1 text-xs bg-destructive/20 text-destructive px-1.5 rounded-full">
                    {liveGames.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sportsbook" className="flex items-center gap-1">
                <span>View All</span>
                <ChevronRight size={16} />
              </Link>
            </Button>
          </div>
          
          <TabsContent value="popular" className="mt-0">
            {isLoading ? (
              <LoadingEvents />
            ) : popularGames.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {popularGames.map(event => (
                  <EnhancedEventCard 
                    key={event.id} 
                    id={event.id}
                    title={event.title} 
                    teams={event.teams}
                    time={event.time}
                    featured={event.featured}
                    gameObject={event.gameObject}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No popular events available right now" />
            )}
          </TabsContent>
          
          <TabsContent value="live" className="mt-0">
            {isLoading ? (
              <LoadingEvents />
            ) : liveGames.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveGames.map(event => (
                  <EnhancedEventCard 
                    key={event.id} 
                    id={event.id}
                    title={event.title} 
                    teams={event.teams}
                    time={event.time}
                    featured={event.featured}
                    live={true}
                    gameObject={event.gameObject}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Zap className="h-10 w-10 text-muted-foreground/50" />}
                message="No live events right now"
                submessage="Check back soon for live action"
              />
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-0">
            {isLoading ? (
              <LoadingEvents />
            ) : upcomingGames.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingGames.map(event => (
                  <EnhancedEventCard 
                    key={event.id} 
                    id={event.id}
                    title={event.title} 
                    teams={event.teams}
                    time={event.time}
                    featured={event.featured}
                    gameObject={event.gameObject}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="h-10 w-10 text-muted-foreground/50" />}
                message="No upcoming events scheduled"
                submessage="Check back soon for new events"
              />
            )}
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Leagues Preview */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={20} className="text-warning" />
            Popular Leagues
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/leagues" className="flex items-center gap-1">
              <span>Browse Leagues</span>
              <ChevronRight size={16} />
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="ghost-card">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardFooter className="pt-2">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {leagues.map(league => (
              <Card key={league.id} className="ghost-card hover:bg-secondary/80 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{league.name}</CardTitle>
                  <CardDescription>{league.members} members</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button variant="secondary" size="sm" className="w-full" asChild>
                    <Link to={`/leagues/${league.id}`}>Join League</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// Loading state component
const LoadingEvents = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map(i => (
      <Card key={i} className="ghost-card">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  submessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, submessage }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon || <div className="w-12 h-12 mb-4 text-muted-foreground/50" />}
    <p className="text-muted-foreground font-medium">{message}</p>
    {submessage && <p className="text-sm text-muted-foreground/70 mt-1">{submessage}</p>}
  </div>
);
