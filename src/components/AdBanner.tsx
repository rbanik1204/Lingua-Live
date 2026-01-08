import { useEffect, useRef } from 'react';

interface AdBannerProps {
  /**
   * Ad slot ID from Google AdSense
   * Example: "1234567890"
   */
  adSlot: string;
  
  /**
   * Ad format - 'auto', 'rectangle', 'vertical', 'horizontal'
   */
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  
  /**
   * Whether this is a responsive ad
   */
  responsive?: boolean;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Ad client ID (usually starts with 'ca-pub-')
   * Example: "ca-pub-1234567890123456"
   */
  adClient?: string;
}

export function AdBanner({
  adSlot,
  adFormat = 'auto',
  responsive = true,
  className = '',
  adClient = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXX'
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Only load ad once
    if (isAdLoaded.current) return;
    
    try {
      // Push ad to Google AdSense
      // @ts-ignore - adsbygoogle is loaded from external script
      if ((window as any).adsbygoogle && adRef.current) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isAdLoaded.current = true;
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}

/**
 * Instructions for setting up Google AdSense:
 * 
 * 1. Sign up for Google AdSense at https://www.google.com/adsense
 * 2. Add your website and verify ownership
 * 3. Create ad units and get your ad client ID and slot IDs
 * 4. Add the AdSense script to your HTML head (in index.html):
 *    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_CLIENT_ID"
 *            crossorigin="anonymous"></script>
 * 5. Update the .env.local file with your client ID:
 *    VITE_ADSENSE_CLIENT=ca-pub-YOUR_CLIENT_ID
 * 6. Use the AdBanner component wherever you want to show ads:
 *    <AdBanner adSlot="YOUR_AD_SLOT_ID" />
 * 
 * Ad Slot Guidelines:
 * - Create different ad slots for different page sections
 * - Use responsive ads for better mobile experience
 * - Don't place too many ads on one page (Google recommends max 3 per page)
 * - Place ads where they won't disrupt user experience
 * 
 * Revenue Model:
 * - Instructors earn revenue based on ad views and clicks
 * - Revenue is calculated by Google and paid monthly
 * - Typical CPM (cost per 1000 impressions): $1-$3
 * - Typical CPC (cost per click): $0.10-$1.00
 */
