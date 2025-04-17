
import React from 'react';
import AdUnit from './AdUnit';

interface SidebarAdProps {
  className?: string;
  slot: string;
}

export const SidebarAd: React.FC<SidebarAdProps> = ({ className = '', slot }) => {
  return (
    <div className={`my-4 ${className}`}>
      <div className="p-2 bg-background/80 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-2 text-center">Sponsored</p>
        <AdUnit slot={slot} format="vertical" className="mx-auto" />
      </div>
    </div>
  );
};

export default SidebarAd;
