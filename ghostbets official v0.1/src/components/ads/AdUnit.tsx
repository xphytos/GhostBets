
import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load ads when the component mounts
    if (adRef.current && typeof window !== 'undefined') {
      try {
        // Add the ad only after the AdSense script has been loaded
        if ((window as any).adsbygoogle) {
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }

    // Clean up
    return () => {
      // No cleanup needed for AdSense
    };
  }, [slot]);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7731566027104237"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdUnit;
