/**
 * Utility to suppress hydration warnings caused by browser extensions
 * that inject attributes like 'rtrvr-listeners' after page load
 */

export const suppressHydrationWarning = () => {
  // Only run on client side
  if (typeof window === 'undefined') return;

  // Store the original console.error
  const originalError = console.error;

  // Override console.error to filter out hydration warnings
  console.error = (...args) => {
    const message = args[0];
    
    // Filter out specific hydration warnings related to browser extensions
    if (
      typeof message === 'string' &&
      (
        message.includes('rtrvr-listeners') ||
        message.includes('Text content did not match') ||
        message.includes('server rendered HTML didn\'t match the client')
      )
    ) {
      return;
    }
    
    // Call original console.error for other errors
    originalError.apply(console, args);
  };
};