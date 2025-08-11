'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClientOnlyLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
}

/**
 * ClientOnlyLink - Extension-safe Link component
 * 
 * This component addresses hydration mismatches caused by browser extensions
 * that inject attributes like 'rtrvr-listeners' into link elements.
 * 
 * Strategy:
 * 1. Renders a fallback div during SSR/initial hydration
 * 2. Replaces with actual Link only after client-side hydration
 * 3. Cleans up any extension-injected attributes periodically
 * 4. Provides graceful fallback navigation if Link fails
 */
export default function ClientOnlyLink({
  href,
  children,
  className = '',
  onClick,
  prefetch = true,
  replace = false,
  scroll = true,
  shallow = false,
}: ClientOnlyLinkProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [usesFallback, setUsesFallback] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  // Track client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clean up extension-injected attributes periodically
  useEffect(() => {
    if (!isMounted || !linkRef.current) return;

    const cleanupExtensionAttributes = () => {
      if (!linkRef.current) return;

      // List of known problematic attributes injected by extensions
      const problematicAttributes = [
        'rtrvr-listeners',
        'data-rtrvr',
        'grammalecte',
        'data-lt-installed',
        'data-gtm-vis-first-on-screen',
        'data-gtm-vis-total-visible-time',
        'data-gtm-vis-has-fired'
      ];

      problematicAttributes.forEach(attr => {
        if (linkRef.current?.hasAttribute(attr)) {
          linkRef.current.removeAttribute(attr);
        }
      });
    };

    // Clean up immediately and then periodically
    cleanupExtensionAttributes();
    const interval = setInterval(cleanupExtensionAttributes, 1000);

    return () => clearInterval(interval);
  }, [isMounted]);

  // Fallback navigation handler
  const handleFallbackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Call original onClick if provided
    if (onClick) {
      onClick(e as any);
    }

    // Navigate using router
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  };

  // Error boundary for Link component
  const handleLinkError = (error: any) => {
    console.warn('Link component failed, falling back to div navigation:', error);
    setUsesFallback(true);
  };

  // Server-side rendering fallback
  if (!isMounted) {
    return (
      <div
        className={`cursor-pointer ${className}`}
        role="link"
        tabIndex={0}
        aria-label={`Navigate to ${href}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFallbackClick(e as any);
          }
        }}
      >
        {children}
      </div>
    );
  }

  // Use fallback navigation if Link component failed
  if (usesFallback) {
    return (
      <div
        className={`cursor-pointer ${className}`}
        role="link"
        tabIndex={0}
        onClick={handleFallbackClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFallbackClick(e);
          }
        }}
        aria-label={`Navigate to ${href}`}
      >
        {children}
      </div>
    );
  }

  // Client-side Link with error handling
  try {
    return (
      <Link
        href={href}
        className={className}
        onClick={onClick}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        ref={linkRef}
        // Suppress hydration warnings for this specific component
        suppressHydrationWarning={true}
      >
        {children}
      </Link>
    );
  } catch (error) {
    handleLinkError(error);
    return (
      <div
        className={`cursor-pointer ${className}`}
        role="link"
        tabIndex={0}
        onClick={handleFallbackClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFallbackClick(e);
          }
        }}
        aria-label={`Navigate to ${href}`}
      >
        {children}
      </div>
    );
  }
}