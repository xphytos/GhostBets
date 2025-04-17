import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedHomeSections } from '@/components/home/EnhancedHomeSections';
import HorizontalAdBanner from '@/components/ads/HorizontalAdBanner';

export const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-xl ghost-glow">
          <div className="ghost-gradient p-6 md:p-8 rounded-xl">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Welcome to GhostBets Fantasy Arena
              </h1>
              <p className="text-lg mb-6 text-foreground/90">
                Bet on your favorite sports, join leagues, and compete with friends - all for free!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="font-medium" size="lg" asChild>
                  <Link to="/sportsbook">
                    Start Betting Now
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/leagues">
                    Join a League
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Ad placement after hero section */}
        <HorizontalAdBanner slot="1234567890" />
        
        {/* Daily Rewards Reminder */}
        <section>
          <Card className="ghost-card border-success/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center text-success">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Daily Rewards Available!</h3>
                  <p className="text-sm text-muted-foreground">Claim your free credits and bonus today</p>
                </div>
              </div>
              <Button asChild variant="ghost" className="gap-1">
                <Link to="/rewards">
                  <span>Claim</span>
                  <ChevronRight size={16} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
        
        {/* How to Bet Guide */}
        <section>
          <Card className="ghost-card border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-medium">New to Betting?</h3>
                  <p className="text-sm text-muted-foreground">Check out our complete guide to sports betting</p>
                </div>
              </div>
              <Button asChild variant="ghost" className="gap-1">
                <Link to="/how-to-bet">
                  <span>Learn Now</span>
                  <ChevronRight size={16} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
        
        {/* Enhanced Home Sections */}
        <EnhancedHomeSections />
        
        {/* Bottom ad placement */}
        <HorizontalAdBanner slot="0987654321" className="mt-8" />
      </div>
    </MainLayout>
  );
};

export default HomePage;
