
import React from 'react';
import AdUnit from './AdUnit';

interface HorizontalAdBannerProps {
  className?: string;
  slot: string;
}

export const HorizontalAdBanner: React.FC<HorizontalAdBannerProps> = ({ className = '', slot }) => {
  return (
    <div className={`w-full my-4 overflow-hidden ${className}`}>
      <AdUnit slot={slot} format="horizontal" className="mx-auto max-w-screen-xl" />
    </div>
  );
};

export default HorizontalAdBanner;
