
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from 'lucide-react';

interface DailyRewardsDisplayProps {
  currentStreak: number;
}

// Generate rewards schedule with cumulative totals
const generateRewardSchedule = (maxDays: number = 7) => {
  let rewards = [];
  let cumulativeTotal = 0;
  
  for (let day = 1; day <= maxDays; day++) {
    const dailyReward = 8 + (day * 2); // Day 1 = 10, Day 2 = 12, Day 3 = 14, etc.
    cumulativeTotal += dailyReward;
    
    rewards.push({
      day,
      dailyReward,
      cumulativeTotal
    });
  }
  
  return rewards;
};

export const DailyRewardsDisplay: React.FC<DailyRewardsDisplayProps> = ({ currentStreak }) => {
  const rewardSchedule = generateRewardSchedule();
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        Daily Streak Rewards
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {rewardSchedule.map(reward => (
          <Card 
            key={reward.day} 
            className={`${currentStreak >= reward.day ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}
          >
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-center text-sm">Day {reward.day}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="text-center font-bold">{reward.dailyReward} coins</div>
              <div className="text-xs text-muted-foreground text-center mt-1">
                Total: {reward.cumulativeTotal} coins
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Keep your daily streak going to earn more rewards each day!
      </div>
    </div>
  );
};
