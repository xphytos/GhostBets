
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gift, Calendar, Trophy, Star, ChevronRight, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { claimDailyReward } from '@/lib/rewards/reward-transactions';
import { useNavigate } from 'react-router-dom';
import { formatTimeRemaining } from '@/lib/utils';

export const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claimedToday, setClaimedToday] = React.useState(false);
  const [streakDays, setStreakDays] = React.useState(0);
  const [coins, setCoins] = React.useState(0);
  const [lastClaimed, setLastClaimed] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('23:59:59');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to access rewards");
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Calculate time remaining until next claim
  useEffect(() => {
    if (!lastClaimed || !claimedToday) return;
    
    const calculateTimeRemaining = () => {
      const lastClaimedDate = new Date(lastClaimed);
      const tomorrow = new Date(lastClaimedDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const now = new Date();
      const diffMs = tomorrow.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setClaimedToday(false);
        setTimeRemaining('00:00:00');
        return;
      }
      
      setTimeRemaining(formatTimeRemaining(diffMs));
    };
    
    // Calculate immediately
    calculateTimeRemaining();
    
    // Set up interval to update countdown
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(intervalId);
  }, [lastClaimed, claimedToday]);
  
  // Fetch user rewards data
  const fetchRewardsData = async () => {
    if (!user) {
      toast.error("Please log in to access rewards");
      navigate('/login');
      return;
    }
    
    try {
      setError(null);
      console.log('Fetching rewards data for user:', user.id);
      
      // Get user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('balance, streak_days, last_reward_claim')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching rewards data:", error);
        setError("Error loading rewards data");
        toast.error("Error loading rewards data. Please try again later.");
        return;
      }
      
      if (!data) {
        console.log("No profile found for user, redirecting to login");
        toast.error("User profile not found. Please log in again.");
        navigate('/login');
        return;
      }
      
      console.log("Profile data loaded:", data);
      setCoins(data.balance || 0);
      setStreakDays(data.streak_days || 0);
      
      // Check if the user has claimed today
      const lastClaimDate = data.last_reward_claim ? new Date(data.last_reward_claim) : null;
      setLastClaimed(data.last_reward_claim);
      
      if (lastClaimDate) {
        const today = new Date();
        const isSameDay = 
          lastClaimDate.getDate() === today.getDate() &&
          lastClaimDate.getMonth() === today.getMonth() &&
          lastClaimDate.getFullYear() === today.getFullYear();
          
        setClaimedToday(isSameDay);
        console.log('Claimed today status:', isSameDay, 'Last claim date:', lastClaimDate);
      } else {
        setClaimedToday(false);
      }
    } catch (error) {
      console.error("Error in fetchRewardsData:", error);
      setError("Failed to load rewards data");
      toast.error("Failed to load rewards data");
    }
  };
  
  // Set up realtime subscription for profile updates
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up reward page for user:', user.id);
    fetchRewardsData();
    
    // Subscribe to realtime updates for the user's profile
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile updated in realtime:', payload);
          // Update the local state with new data
          if (payload.new) {
            setCoins(payload.new.balance || 0);
            setStreakDays(payload.new.streak_days || 0);
            
            // Check if claimed today
            const lastClaimDate = payload.new.last_reward_claim ? new Date(payload.new.last_reward_claim) : null;
            setLastClaimed(payload.new.last_reward_claim);
            
            if (lastClaimDate) {
              const today = new Date();
              const isSameDay = 
                lastClaimDate.getDate() === today.getDate() &&
                lastClaimDate.getMonth() === today.getMonth() &&
                lastClaimDate.getFullYear() === today.getFullYear();
                
              setClaimedToday(isSameDay);
            }
          }
        }
      )
      .subscribe();
      
    console.log('Realtime channel subscribed for profile changes');
      
    return () => {
      console.log('Cleaning up reward page subscription');
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);
  
  const handleClaimDaily = async () => {
    if (!user) {
      toast.error("You must be logged in to claim rewards");
      navigate('/login');
      return;
    }
    
    if (claimedToday) {
      toast.error("You have already claimed your reward today");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Claiming daily reward for user:', user.id);
      
      // Use the transactional claiming function
      const baseReward = 10;
      const result = await claimDailyReward(user.id, baseReward, streakDays);
      
      if (!result.success) {
        const errorMsg = result.error || "Failed to claim reward. Please try again later.";
        console.error("Reward claim failed:", errorMsg);
        setError(errorMsg);
        
        if (errorMsg === 'Already claimed today') {
          toast.error("You've already claimed your daily reward today!");
          setClaimedToday(true);
        } else if (errorMsg.includes('User profile not found')) {
          toast.error("Authentication issue. Please log in again.");
          navigate('/login');
        } else {
          toast.error(errorMsg);
        }
        return;
      }
      
      // Update local state with the returned values
      if (result.newBalance !== undefined) {
        setCoins(result.newBalance);
      }
      
      if (result.newStreakDays !== undefined) {
        setStreakDays(result.newStreakDays);
      }
      
      setClaimedToday(true);
      setLastClaimed(new Date().toISOString());
      setError(null);
      
      // Calculate the reward amount for the toast message
      const streakBonus = Math.floor(streakDays / 5) * 2;
      const totalReward = baseReward + streakBonus;
      
      toast.success(`Claimed ${totalReward} coins! Keep your streak going!`);
      console.log('Reward claim success:', {
        newBalance: result.newBalance,
        newStreakDays: result.newStreakDays,
        reward: totalReward
      });
    } catch (error) {
      console.error("Error in handleClaimDaily:", error);
      setError("Failed to claim reward");
      toast.error("Failed to claim reward");
    } finally {
      setLoading(false);
    }
  };
  
  // If not logged in, don't render the page content
  if (!user) {
    return <MainLayout>
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-6">Please log in to access rewards</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    </MainLayout>;
  }
  
  // Render page content for authenticated users
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Gift className="text-success" />
          Daily Rewards
        </h1>
        <p className="text-muted-foreground">
          Claim rewards daily to build your streak and earn bigger bonuses!
        </p>
      </div>
      
      {/* Daily Claim Card */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="ghost-card overflow-hidden">
            <CardHeader className="ghost-gradient pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Login Bonus
              </CardTitle>
              <CardDescription className="text-foreground/90">
                Claim once every 24 hours to build your streak
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-lg font-medium mb-1">Current Streak: {streakDays} days</div>
                  <div className="text-sm text-muted-foreground">
                    Next milestone: {streakDays >= 5 ? 10 : 5} days
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold ghost-gradient bg-clip-text text-transparent">
                    {claimedToday ? "CLAIMED" : `+${10 + Math.floor(streakDays / 5) * 2} Coins`}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to next reward</span>
                  <span>{streakDays % 5}/{5} days</span>
                </div>
                <Progress value={(streakDays % 5) * 20} className="h-2" />
              </div>
              
              {error && error !== 'Already claimed today' && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <Button 
                className="w-full" 
                size="lg" 
                disabled={claimedToday || loading}
                onClick={handleClaimDaily}
              >
                {loading ? "Processing..." : claimedToday ? "Already Claimed Today" : "Claim Daily Reward"}
              </Button>
              {claimedToday && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Come back in <span className="font-semibold text-success">{timeRemaining}</span> to continue your streak!
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Streak Rewards */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="text-warning" />
              Streak Rewards
            </h2>
            <div className="grid gap-4 md:grid-cols-5">
              {[1, 2, 3, 4, 5].map(day => (
                <Card 
                  key={day}
                  className={`ghost-card relative overflow-hidden ${day <= streakDays % 5 || (day === 5 && streakDays % 5 === 0 && streakDays > 0) ? 'border-success/50' : ''}`}
                >
                  <CardHeader className="py-3 px-3 text-center">
                    <CardTitle className="text-sm">Day {day}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 text-center">
                    <div className="text-lg font-bold">
                      {day * 2} Coins
                    </div>
                    {day <= streakDays % 5 || (day === 5 && streakDays % 5 === 0 && streakDays > 0) ? (
                      <div className="absolute -right-3 -top-3 bg-success text-white text-xs p-1 rotate-12">
                        Claimed
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        {/* VIP Rewards */}
        <div>
          <Card className="ghost-card mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-warning h-5 w-5" />
                VIP Rewards
              </CardTitle>
              <CardDescription>
                Unlock exclusive bonuses
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2 rounded-md bg-secondary">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Silver VIP</h4>
                    <p className="text-xs text-muted-foreground">Daily 1,000 coins bonus</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground">Gold VIP</h4>
                    <p className="text-xs text-muted-foreground">Locked</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground">Diamond VIP</h4>
                    <p className="text-xs text-muted-foreground">Locked</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Weekly Challenge */}
          <Card className="ghost-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Weekly Challenge</CardTitle>
                  <CardDescription>4 days remaining</CardDescription>
                </div>
                <div className="text-xl font-bold ghost-gradient bg-clip-text text-transparent">
                  5,000 Coins
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Place 10 bets</span>
                    <span className="font-medium">3/10</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Win 5 bets</span>
                    <span className="font-medium">1/5</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Join a league</span>
                    <span className="font-medium">0/1</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RewardsPage;
