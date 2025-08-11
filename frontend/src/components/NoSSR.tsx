'use client';

import { useEffect, useState } from 'react';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

/**
 * NoSSR - Prevents server-side rendering hydration mismatches
 * 
 * This component ensures that certain parts of the UI only render on the client-side,
 * preventing hydration mismatches caused by browser extensions or dynamic content.
 * 
 * Features:
 * - Completely skips SSR for wrapped content
 * - Provides customizable loading fallback
 * - Optional delay for smoother transitions
 * - Prevents flash of unstyled content
 */
export default function NoSSR({ 
  children, 
  fallback = null, 
  delay = 0 
}: NoSSRProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setIsMounted(true);
    }
  }, [delay]);

  // Return fallback or nothing during SSR
  if (!isMounted) {
    return <>{fallback}</>;
  }

  // Return actual content only after client-side mount
  return <>{children}</>;
}