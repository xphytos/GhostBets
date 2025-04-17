
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Book, 
  Calculator, 
  Calendar, 
  Clock, 
  DollarSign, 
  HelpCircle, 
  Shield, 
  Trophy, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Betting Guide Content Components
const BettingGuideHero = () => (
  <section className="mb-8 relative overflow-hidden rounded-xl ghost-glow">
    <div className="ghost-gradient p-6 md:p-8 rounded-xl">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          How to Bet on GhostBets
        </h1>
        <p className="text-lg mb-6 text-foreground/90">
          Your complete guide to placing bets, understanding odds, and having fun with fantasy betting.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button className="font-medium" size="lg" asChild>
            <a href="#betting-basics">
              Start Learning
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/sportsbook">
              Go to Sportsbook
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const BettingBasics = () => (
  <Card className="mb-8" id="betting-basics">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Book className="h-6 w-6 text-primary" />
        Betting Basics
      </CardTitle>
      <CardDescription>
        Everything you need to know to get started with sports betting
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">What is Sports Betting?</h3>
          <p>
            Sports betting is the activity of predicting sports results and placing wagers on the outcome. At GhostBets, you use fantasy coins to bet on real sports events without risking real money.
          </p>
          <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80" 
              alt="People watching sports event"
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">Your GhostBets Account</h3>
          <p>
            When you sign up, you receive 15 free betting coins to start with. You can earn more coins through daily rewards, winning bets, and participating in special events.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Getting Started</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create an account on GhostBets</li>
              <li>Collect your 15 free coins</li>
              <li>Browse available sports events</li>
              <li>Place your first bet</li>
              <li>Track your bets in "My Bets"</li>
            </ol>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UnderstandingOdds = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-primary" />
        Understanding Odds
      </CardTitle>
      <CardDescription>
        Learn how to read odds and calculate potential payouts
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="american">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="american">American Odds</TabsTrigger>
          <TabsTrigger value="decimal">Decimal Odds</TabsTrigger>
          <TabsTrigger value="fractional">Fractional Odds</TabsTrigger>
        </TabsList>
        <TabsContent value="american" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">American Odds (Moneyline)</h3>
              <p>
                American odds are displayed with a plus (+) or minus (-) sign, followed by a number:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-semibold text-success">+200</span>: A $100 bet would win $200 (plus your stake back)
                </li>
                <li>
                  <span className="font-semibold text-foreground">-150</span>: You need to bet $150 to win $100 (plus your stake back)
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 bg-secondary/20">
              <h4 className="font-medium mb-4">Example Calculation</h4>
              <p className="mb-2">For a +200 odds bet with 5 coins:</p>
              <div className="p-3 bg-accent/10 rounded-md font-mono text-sm">
                Potential Win = (5 × 200) ÷ 100 = 10 coins
              </div>
              <p className="mt-4 mb-2">For a -150 odds bet with 15 coins:</p>
              <div className="p-3 bg-accent/10 rounded-md font-mono text-sm">
                Potential Win = (15 × 100) ÷ 150 = 10 coins
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="decimal" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Decimal Odds</h3>
              <p>
                Decimal odds represent the total return for each unit bet, including your stake:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-semibold">2.00</span>: A $1 bet would return $2 total (including your stake)
                </li>
                <li>
                  <span className="font-semibold">1.67</span>: A $1 bet would return $1.67 total (including your stake)
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 bg-secondary/20">
              <h4 className="font-medium mb-4">Example Calculation</h4>
              <p className="mb-2">For 3.00 decimal odds with 5 coins:</p>
              <div className="p-3 bg-accent/10 rounded-md font-mono text-sm">
                Total Return = 5 × 3.00 = 15 coins
              </div>
              <p className="mt-4 mb-2">Net Profit = Total Return - Stake</p>
              <div className="p-3 bg-accent/10 rounded-md font-mono text-sm">
                Net Profit = 15 - 5 = 10 coins
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="fractional" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Fractional Odds</h3>
              <p>
                Fractional odds show the profit relative to the stake:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-semibold">2/1</span> (or "2 to 1"): A $1 bet would profit $2 (plus your stake back)
                </li>
                <li>
                  <span className="font-semibold">1/2</span> (or "1 to 2"): A $2 bet would profit $1 (plus your stake back)
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 bg-secondary/20">
              <h4 className="font-medium mb-4">Example Calculation</h4>
              <p className="mb-2">For 5/1 fractional odds with 3 coins:</p>
              <div className="p-3 bg-accent/10 rounded-md font-mono text-sm">
                Profit = (3 × 5) ÷ 1 = 15 coins
              </div>
              <p className="mt-4 mb-2">Total Return = Profit + Stake</p>
              <div className="p-3 bg-accent/10 rounded-md font-mono text-sm">
                Total Return = 15 + 3 = 18 coins
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

const TypesOfBets = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        Types of Bets
      </CardTitle>
      <CardDescription>
        Explore different betting options available on GhostBets
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="font-medium">Moneyline</span>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">Most Popular</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-3">
                  A moneyline bet is the simplest form of betting. You're simply picking which team will win the game, with no point spreads involved.
                </p>
                <p>
                  Example: <span className="font-medium">Lakers -150</span> vs <span className="font-medium">Warriors +130</span>
                </p>
              </div>
              <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1518371885924-4f83c3b0d9bb?auto=format&fit=crop&w=800&q=80" 
                  alt="Basketball game action"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="font-medium">Point Spread</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-3">
                  Point spread betting involves a margin of victory. The favorite has to win by more than the spread, while the underdog can lose by less than the spread or win outright.
                </p>
                <p>
                  Example: <span className="font-medium">Bills -7.5 (-110)</span> vs <span className="font-medium">Jets +7.5 (-110)</span>
                </p>
              </div>
              <div className="rounded-lg border p-4 bg-secondary/20">
                <h4 className="font-medium mb-2">How to Win</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Bills must win by 8+ points</li>
                  <li>Jets must lose by 7 or fewer, or win</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="font-medium">Over/Under (Totals)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-3">
                  With an over/under bet, you're wagering on the total combined score of both teams, regardless of who wins the game.
                </p>
                <p>
                  Example: <span className="font-medium">Yankees vs Red Sox - O/U 8.5 runs</span>
                </p>
              </div>
              <div className="rounded-lg border p-4 bg-secondary/20">
                <h4 className="font-medium mb-2">How to Win</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Over: Combined score must be 9+ runs</li>
                  <li>Under: Combined score must be 8 or fewer runs</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="font-medium">Parlays</span>
              <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">Advanced</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-3">
                  A parlay combines multiple bets into one. All selections must win for the parlay to pay out, but the potential payout is much higher than individual bets.
                </p>
                <p className="mb-2">
                  Example: 3-team parlay
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Chiefs -3.5</li>
                  <li>Lakers moneyline</li>
                  <li>Yankees/Red Sox Over 8.5</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4 bg-secondary/20">
                <h4 className="font-medium mb-2">Risk vs. Reward</h4>
                <p className="text-sm mb-2">Parlays offer higher payouts but are harder to win:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-accent/10 rounded-md">
                    <div className="font-medium">2-team parlay</div>
                    <div>~2.6x payout</div>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-md">
                    <div className="font-medium">3-team parlay</div>
                    <div>~6x payout</div>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-md">
                    <div className="font-medium">4-team parlay</div>
                    <div>~11x payout</div>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-md">
                    <div className="font-medium">5-team parlay</div>
                    <div>~22x payout</div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="font-medium">Prop Bets</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>
                Proposition bets (props) focus on specific events within a game rather than the final outcome. They can be on team or player performances.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-accent/5">
                  <h4 className="font-medium mb-2">Player Props Examples</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Steph Curry Over/Under 28.5 points</li>
                    <li>Patrick Mahomes Over/Under 2.5 touchdown passes</li>
                    <li>Aaron Judge to hit a home run (Yes/No)</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-accent/5">
                  <h4 className="font-medium mb-2">Team Props Examples</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Lakers 1st Quarter Total Points O/U 27.5</li>
                    <li>Chiefs Total Sacks O/U 3.5</li>
                    <li>Manchester United to score in both halves (Yes/No)</li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>
);

const HowToPlaceABet = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        How to Place a Bet
      </CardTitle>
      <CardDescription>
        Step-by-step guide to placing your first bet on GhostBets
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-success/20 bg-success/5">
          <p className="text-sm text-success">
            On GhostBets, you'll be betting with virtual coins - no real money is used!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-bold">1</span>
            </div>
            <h3 className="font-medium">Navigate to Sportsbook</h3>
            <p className="text-sm text-muted-foreground">
              Go to the Sportsbook section from the navigation menu to view all available sports and events.
            </p>
            <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1518371885924-4f83c3b0d9bb?auto=format&fit=crop&w=800&q=80" 
                alt="Sportsbook interface"
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-bold">2</span>
            </div>
            <h3 className="font-medium">Select an Event</h3>
            <p className="text-sm text-muted-foreground">
              Browse through available games and click on the event you want to bet on to see all betting options.
            </p>
            <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80" 
                alt="Sports event selection"
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-bold">3</span>
            </div>
            <h3 className="font-medium">Choose Your Bet Type</h3>
            <p className="text-sm text-muted-foreground">
              Select the type of bet you want to place (moneyline, spread, over/under, etc.).
            </p>
            <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=800&q=80" 
                alt="Bet type selection"
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-bold">4</span>
            </div>
            <h3 className="font-medium">Add to Bet Slip</h3>
            <p className="text-sm text-muted-foreground">
              Click on the odds to add your selection to the bet slip. You can add multiple selections for a parlay.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-bold">5</span>
            </div>
            <h3 className="font-medium">Enter Your Stake</h3>
            <p className="text-sm text-muted-foreground">
              Enter the amount of coins you want to wager in the bet slip. The potential payout will be calculated automatically.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-bold">6</span>
            </div>
            <h3 className="font-medium">Confirm Your Bet</h3>
            <p className="text-sm text-muted-foreground">
              Review your selections and stake, then click "Place Bet" to confirm. Your bet will appear in "My Bets" section.
            </p>
          </div>
        </div>
        
        <Collapsible className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              View Sample Bet Slip
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="rounded-lg border p-4 bg-secondary/20">
              <h4 className="font-medium mb-4">Sample Bet Slip</h4>
              <div className="space-y-4">
                <div className="p-3 border rounded-md bg-card">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Lakers Moneyline</span>
                    <span>-150</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Los Angeles Lakers vs Golden State Warriors</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Wager (Coins)</label>
                    <div className="p-2 border rounded-md mt-1 bg-accent/5">5</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Potential Payout</label>
                    <div className="p-2 border rounded-md mt-1 bg-accent/5 text-success">8.33</div>
                  </div>
                </div>
                
                <Button className="w-full">Place Bet</Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </CardContent>
  </Card>
);

const BettingTips = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        Betting Tips & Responsible Gaming
      </CardTitle>
      <CardDescription>
        Smart betting strategies and responsible gaming practices
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 border rounded-lg bg-accent/5">
            <h3 className="flex items-center gap-2 font-medium mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              Betting Tips for Beginners
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</div>
                <p className="text-sm">Start with small wagers until you're comfortable with how betting works</p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</div>
                <p className="text-sm">Bet on sports you understand and follow regularly</p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">3</div>
                <p className="text-sm">Research teams, players, and recent performance before placing bets</p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">4</div>
                <p className="text-sm">Keep track of your betting history to learn from wins and losses</p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">5</div>
                <p className="text-sm">Don't chase losses - stick to your strategy</p>
              </li>
            </ul>
          </div>
          
          <div className="p-5 border rounded-lg bg-warning/5 border-warning/20">
            <h3 className="flex items-center gap-2 font-medium mb-4">
              <Shield className="h-5 w-5 text-warning" />
              Responsible Gaming
            </h3>
            <p className="text-sm mb-4">
              Even though GhostBets uses virtual coins and not real money, we encourage responsible gaming habits:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning text-xs">•</div>
                <p className="text-sm">Set a coin budget and stick to it</p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning text-xs">•</div>
                <p className="text-sm">Take breaks from betting to maintain a healthy balance</p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning text-xs">•</div>
                <p className="text-sm">Never bet more than you're willing to lose, even with virtual coins</p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning text-xs">•</div>
                <p className="text-sm">Betting should be entertaining, not a source of stress</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg bg-secondary/10">
          <h3 className="font-medium mb-3">Bankroll Management</h3>
          <p className="text-sm mb-4">
            Good bankroll management is crucial for long-term success in sports betting:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-accent/10 rounded-md">
              <h4 className="text-sm font-medium mb-2">Unit Sizing</h4>
              <p className="text-xs">Determine a standard bet size (unit) based on your total bankroll. A common recommendation is 1-5% of your total coins.</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-md">
              <h4 className="text-sm font-medium mb-2">Record Keeping</h4>
              <p className="text-xs">Track all your bets, including bet type, stake, odds, and outcome to analyze your performance over time.</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-md">
              <h4 className="text-sm font-medium mb-2">Flat Betting</h4>
              <p className="text-xs">Stick to betting the same amount (1 unit) on each wager, regardless of how confident you are in the outcome.</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const FAQ = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-primary" />
        Frequently Asked Questions
      </CardTitle>
      <CardDescription>
        Common questions about betting on GhostBets
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="faq-1">
          <AccordionTrigger>
            Is GhostBets real money gambling?
          </AccordionTrigger>
          <AccordionContent>
            No, GhostBets is a fantasy betting platform that uses virtual coins instead of real money. You cannot deposit or withdraw real currency, and all betting is done with our in-game fantasy coins.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionTrigger>
            How do I get more coins?
          </AccordionTrigger>
          <AccordionContent>
            You can earn more coins through:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Daily login rewards</li>
              <li>Winning bets</li>
              <li>Participating in special events</li>
              <li>Completing challenges</li>
              <li>Inviting friends to join GhostBets</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-3">
          <AccordionTrigger>
            What happens if I run out of coins?
          </AccordionTrigger>
          <AccordionContent>
            If your balance reaches zero, you can still claim daily rewards to build your bankroll back up. We also periodically offer special promotions where you can earn bonus coins.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-4">
          <AccordionTrigger>
            How do live bets work?
          </AccordionTrigger>
          <AccordionContent>
            Live betting allows you to place bets on games that are already in progress. Odds update in real-time based on the current state of the game. This creates exciting opportunities to bet based on how you think the game will unfold after seeing some action.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-5">
          <AccordionTrigger>
            Can I cancel a bet after placing it?
          </AccordionTrigger>
          <AccordionContent>
            Once a bet is confirmed, it cannot be canceled or modified. Make sure to double-check all the details before confirming your wager.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-6">
          <AccordionTrigger>
            How are bets settled?
          </AccordionTrigger>
          <AccordionContent>
            Bets are settled based on the official final result of the event. For most mainstream sports, results are typically available and bets are settled shortly after the event concludes. For some events, it may take longer if official results are delayed.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>
);

const GlossarySection = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Book className="h-6 w-6 text-primary" />
        Betting Glossary
      </CardTitle>
      <CardDescription>
        Common terms you'll encounter in sports betting
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { term: "Action", definition: "Any wager placed on a sporting event" },
          { term: "Bankroll", definition: "The total amount of money (or coins) available for betting" },
          { term: "Cover", definition: "When a team wins by more than the point spread" },
          { term: "Dog/Underdog", definition: "The team or contestant expected to lose" },
          { term: "Favorite", definition: "The team or contestant expected to win" },
          { term: "Handicap", definition: "Giving an advantage to one team in the form of points" },
          { term: "Juice/Vig", definition: "The commission a sportsbook charges for taking a bet" },
          { term: "Lock", definition: "A bet that is considered a sure winner (though no bet is truly guaranteed)" },
          { term: "Push", definition: "When a bet ties and the stake is returned" },
          { term: "Value Bet", definition: "A wager with odds that favor the bettor over the house" },
        ].map((item, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <Button variant="outline" className="justify-between w-full">
                <span>{item.term}</span>
                <span className="text-muted-foreground">View Definition</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{item.term}</DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-base pt-2">
                {item.definition}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SportsGuide = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        Sports-Specific Betting Guides
      </CardTitle>
      <CardDescription>
        Learn about betting on different sports
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="football">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="football">Football</TabsTrigger>
          <TabsTrigger value="basketball">Basketball</TabsTrigger>
          <TabsTrigger value="baseball">Baseball</TabsTrigger>
          <TabsTrigger value="soccer">Soccer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="football" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Football Betting</h3>
              <p>
                Football (NFL) is the most popular sport for betting in the United States. Games typically have point spreads, moneylines, and over/under totals.
              </p>
              <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=800&q=80" 
                  alt="Football game"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Popular Football Bets</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Point Spread (most common)</li>
                  <li>Moneyline</li>
                  <li>Over/Under (Total Points)</li>
                  <li>Player Props (TDs, passing yards, etc.)</li>
                  <li>First Half/Second Half</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Key Betting Factors</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Home field advantage (~3 points)</li>
                  <li>Weather conditions</li>
                  <li>Key player injuries</li>
                  <li>Divisional rivalries</li>
                  <li>Rest (teams coming off bye weeks)</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="basketball" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Basketball Betting</h3>
              <p>
                Basketball (NBA) offers fast-paced action with high-scoring games, making it popular for over/under and live betting.
              </p>
              <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80" 
                  alt="Basketball game"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Popular Basketball Bets</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Point Spread</li>
                  <li>Moneyline</li>
                  <li>Over/Under</li>
                  <li>Quarter/Half Betting</li>
                  <li>Player Props (points, rebounds, assists)</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Key Betting Factors</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Back-to-back games (fatigue)</li>
                  <li>Home court advantage</li>
                  <li>Player rest strategies</li>
                  <li>Pace of play</li>
                  <li>Matchup history</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="baseball" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Baseball Betting</h3>
              <p>
                Baseball (MLB) betting is unique with its moneyline focus and run lines instead of traditional point spreads.
              </p>
              <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=800&q=80" 
                  alt="Baseball game"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Popular Baseball Bets</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Moneyline (primary bet type)</li>
                  <li>Run Line (typically +/- 1.5 runs)</li>
                  <li>Over/Under (total runs)</li>
                  <li>5-Inning Line (first half betting)</li>
                  <li>Player Props (hits, HRs, strikeouts)</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Key Betting Factors</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Starting pitchers (most important)</li>
                  <li>Bullpen strength and availability</li>
                  <li>Weather and ballpark factors</li>
                  <li>Day games vs. night games</li>
                  <li>Lineup changes/rest days</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="soccer" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Soccer Betting</h3>
              <p>
                Soccer offers unique betting options like the three-way moneyline (home/draw/away) and numerous prop betting opportunities.
              </p>
              <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80" 
                  alt="Soccer game"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Popular Soccer Bets</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Three-Way Moneyline (Home/Draw/Away)</li>
                  <li>Over/Under Goals</li>
                  <li>Both Teams to Score (Yes/No)</li>
                  <li>Asian Handicap</li>
                  <li>Correct Score</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/10">
                <h4 className="font-medium mb-2">Key Betting Factors</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Home field advantage</li>
                  <li>Team motivation (tournament vs. league)</li>
                  <li>Playing style matchups</li>
                  <li>Squad rotation/lineup changes</li>
                  <li>Weather and pitch conditions</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

const LiveBettingGuide = () => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-primary" />
        Live Betting Guide
      </CardTitle>
      <CardDescription>
        How to bet on games in progress
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">What is Live Betting?</h3>
            <p>
              Live betting (or in-play betting) allows you to place bets on games that are already in progress. Odds update in real-time based on the current score, time remaining, and other factors.
            </p>
            <div className="aspect-video rounded-lg bg-accent/10 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1542896644-3af983a1bf17?auto=format&fit=crop&w=800&q=80" 
                alt="Live betting dashboard"
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Advantages of Live Betting</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-accent/10 rounded-md">
                <h4 className="text-sm font-medium">Better Information</h4>
                <p className="text-sm">You can gauge team performance, momentum, and strategy before placing your bet.</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-md">
                <h4 className="text-sm font-medium">Value Opportunities</h4>
                <p className="text-sm">Odds may not adjust quickly enough to reflect what's happening in the game.</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-md">
                <h4 className="text-sm font-medium">More Betting Options</h4>
                <p className="text-sm">Live betting offers unique markets like "next team to score" or "race to X points."</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-secondary/10">
          <h3 className="font-medium mb-3">Live Betting Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</div>
              <p className="text-sm">Watch the game if possible - visual information is invaluable for live betting</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</div>
              <p className="text-sm">Act quickly when you spot value - odds change rapidly during live events</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">3</div>
              <p className="text-sm">Focus on one game at a time to make better informed decisions</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">4</div>
              <p className="text-sm">Look for momentum shifts that the odds haven't fully accounted for</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg bg-secondary/5">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Live Events
            </h4>
            <p className="text-sm mb-3">
              Check the "Live" section of our sportsbook to see upcoming games available for live betting.
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/live">View Live Events</Link>
            </Button>
          </div>
          <div className="p-4 border rounded-lg bg-secondary/5">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Live Betting Markets
            </h4>
            <p className="text-sm mb-3">
              Common live markets include updated point spreads, moneylines, totals, and next score props.
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/sportsbook">Explore Markets</Link>
            </Button>
          </div>
          <div className="p-4 border rounded-lg bg-secondary/5">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Live Betting Communities
            </h4>
            <p className="text-sm mb-3">
              Join our community discussions to share live betting strategies and tips with other users.
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/social">Join Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Component
export const HowToBetPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <BettingGuideHero />
        <BettingBasics />
        <UnderstandingOdds />
        <TypesOfBets />
        <HowToPlaceABet />
        <SportsGuide />
        <LiveBettingGuide />
        <BettingTips />
        <GlossarySection />
        <FAQ />
        
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-medium mb-4">Ready to Start Betting?</h3>
            <p className="mb-6 max-w-xl mx-auto">
              Now that you understand the basics of sports betting, it's time to put your knowledge to the test!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/sportsbook">
                  Go to Sportsbook
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/rewards">
                  Claim Daily Rewards
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HowToBetPage;

