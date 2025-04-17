
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Component to display instructional images for the How to Bet page
export const HowToBetImages = () => {
  // Images with captions for the how to bet section
  const instructionalImages = [
    {
      id: 1,
      src: "https://static.foxbusiness.com/foxbusiness.com/content/uploads/2023/07/online-sports-betting.jpg",
      alt: "Moneyline Betting Example",
      caption: "Moneyline bets are straightforward wagers on which team will win the game. No point spreads involved - just pick the winner!"
    },
    {
      id: 2,
      src: "https://sportsbetting.legal/wp-content/uploads/2019/10/nfl-betting-lines-1280x720.jpg",
      alt: "Point Spread Betting Example",
      caption: "Point spread bets involve a handicap (the spread) that the favored team must overcome. This evens the odds between teams of different skill levels."
    },
    {
      id: 3,
      src: "https://www.bettingbuck.com/wp-content/uploads/2020/10/sports-bet-types-over-under-1024x683.jpg", 
      alt: "Over/Under Betting Example",
      caption: "Over/Under (totals) bets are wagers on whether the combined score of both teams will be higher or lower than a number set by oddsmakers."
    },
    {
      id: 4,
      src: "https://sportshub.cbsistatic.com/i/2022/04/07/25c78e3e-92aa-4dc3-a15a-da9113c1db51/how-to-read-betting-odds.jpg",
      alt: "How to Use the Bet Slip",
      caption: "Add selections to your bet slip by clicking on odds you want to bet on. Enter your stake amount and see potential winnings before confirming."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {instructionalImages.map(image => (
        <Card key={image.id} className="overflow-hidden">
          <AspectRatio ratio={16/9} className="bg-muted">
            <img 
              src={image.src} 
              alt={image.alt} 
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </AspectRatio>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{image.caption}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
