'use client';

import { useEffect, useRef, ComponentType } from 'react';

/**
 * Extension-resilient Higher-Order Component (HOC)
 * 
 * This HOC wraps components to make them resistant to browser extension modifications.
 * It actively monitors and cleans up extension-injected attributes that can cause
 * hydration mismatches and React reconciliation issues.
 */

interface ExtensionResilientConfig {
  // Attributes to monitor and clean up
  cleanupAttributes?: string[];
  // How often to run cleanup (ms)
  cleanupInterval?: number;
  // Whether to log when cleanup occurs
  debug?: boolean;
  // Custom cleanup function
  customCleanup?: (element: HTMLElement) => void;
}

const DEFAULT_CONFIG: Required<ExtensionResilientConfig> = {
  cleanupAttributes: [
    'rtrvr-listeners',
    'data-rtrvr',
    'grammalecte',
    'data-lt-installed',
    'data-gtm-vis-first-on-screen',
    'data-gtm-vis-total-visible-time',
    'data-gtm-vis-has-fired',
    'data-ms-editor',
    'data-grammarly',
    'spellcheck-error',
    'data-1password-ignore',
    'data-lastpass-ignore',
    'data-dashlane-ignore'
  ],
  cleanupInterval: 2000,
  debug: false,
  customCleanup: () => {}
};

/**
 * HOC to make components extension-resilient
 */
export function withExtensionResilience<T extends object>(
  WrappedComponent: ComponentType<T>,
  config: ExtensionResilientConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const ExtensionResilientComponent = (props: T) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      const cleanup = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const elements = container.querySelectorAll('*');

        let cleanedCount = 0;

        // Clean up problematic attributes from all descendants
        elements.forEach((element) => {
          finalConfig.cleanupAttributes.forEach((attr) => {
            if (element.hasAttribute(attr)) {
              element.removeAttribute(attr);
              cleanedCount++;
            }
          });

          // Run custom cleanup if provided
          if (finalConfig.customCleanup && element instanceof HTMLElement) {
            finalConfig.customCleanup(element);
          }
        });

        if (finalConfig.debug && cleanedCount > 0) {
          console.log(`ExtensionResilient: Cleaned ${cleanedCount} attributes`);
        }
      };

      // Initial cleanup
      cleanup();

      // Set up periodic cleanup
      cleanupIntervalRef.current = setInterval(cleanup, finalConfig.cleanupInterval);

      // Cleanup on unmount
      return () => {
        if (cleanupIntervalRef.current) {
          clearInterval(cleanupIntervalRef.current);
        }
      };
    }, []);

    return (
      <div ref={containerRef} style={{ display: 'contents' }}>
        <WrappedComponent {...props} />
      </div>
    );
  };

  ExtensionResilientComponent.displayName = `ExtensionResilient(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ExtensionResilientComponent;
}

/**
 * Hook to use extension resilience in functional components
 */
export function useExtensionResilience(
  config: ExtensionResilientConfig = {}
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    const cleanup = () => {
      if (!elementRef.current) return;

      const element = elementRef.current;
      let cleanedCount = 0;

      // Clean up attributes from the element itself
      finalConfig.cleanupAttributes.forEach((attr) => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
          cleanedCount++;
        }
      });

      // Clean up attributes from all descendants
      const descendants = element.querySelectorAll('*');
      descendants.forEach((descendant) => {
        finalConfig.cleanupAttributes.forEach((attr) => {
          if (descendant.hasAttribute(attr)) {
            descendant.removeAttribute(attr);
            cleanedCount++;
          }
        });

        if (finalConfig.customCleanup && descendant instanceof HTMLElement) {
          finalConfig.customCleanup(descendant);
        }
      });

      if (finalConfig.debug && cleanedCount > 0) {
        console.log(`useExtensionResilience: Cleaned ${cleanedCount} attributes`);
      }
    };

    // Initial cleanup
    const timer = setTimeout(cleanup, 100);

    // Set up periodic cleanup
    const interval = setInterval(cleanup, finalConfig.cleanupInterval);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return elementRef;
}

/**
 * Utility function to immediately clean extension attributes from an element
 */
export function cleanExtensionAttributes(
  element: HTMLElement,
  attributes?: string[]
): number {
  const attrsToClean = attributes || DEFAULT_CONFIG.cleanupAttributes;
  let cleanedCount = 0;

  attrsToClean.forEach((attr) => {
    if (element.hasAttribute(attr)) {
      element.removeAttribute(attr);
      cleanedCount++;
    }
  });

  // Also clean descendants
  const descendants = element.querySelectorAll('*');
  descendants.forEach((descendant) => {
    attrsToClean.forEach((attr) => {
      if (descendant.hasAttribute(attr)) {
        descendant.removeAttribute(attr);
        cleanedCount++;
      }
    });
  });

  return cleanedCount;
}

/**
 * Observer-based extension resistance (for dynamic content)
 */
export class ExtensionResistanceObserver {
  private observer: MutationObserver;
  private config: Required<ExtensionResilientConfig>;

  constructor(config: ExtensionResilientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement;
          const attributeName = mutation.attributeName;

          if (attributeName && this.config.cleanupAttributes.includes(attributeName)) {
            target.removeAttribute(attributeName);
            
            if (this.config.debug) {
              console.log(`ExtensionResistanceObserver: Removed ${attributeName} from`, target);
            }
          }
        }
      });
    });
  }

  observe(element: HTMLElement): void {
    this.observer.observe(element, {
      attributes: true,
      attributeFilter: this.config.cleanupAttributes,
      subtree: true
    });
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}