/**
 * Device Detection Utilities
 * Detects mobile, tablet, desktop, and various device capabilities
 */

/**
 * Detects if the current device is mobile
 * Checks both user agent and touch capability
 */
export function isMobileDevice(): boolean {
  // Check if window is available (SSR safety)
  if (typeof window === 'undefined') {
    return false;
  }

  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile user agent patterns
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  
  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size (typically mobile if width < 768px)
  const isSmallScreen = window.innerWidth < 768;
  
  // Device is mobile if it matches user agent OR (has touch AND small screen)
  return isMobileUA || (hasTouch && isSmallScreen);
}

/**
 * Detects if the current device is a tablet
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Tablet patterns
  const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i;
  const isTabletUA = tabletRegex.test(userAgent);
  
  // Check screen size (tablets typically 768px - 1024px)
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  return isTabletUA || (isTabletScreen && 'ontouchstart' in window);
}

/**
 * Get detailed device information
 */
export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      screenWidth: 0,
      screenHeight: 0,
      orientation: 'landscape' as 'portrait' | 'landscape',
    };
  }

  const mobile = isMobileDevice();
  const tablet = isTabletDevice();
  
  return {
    isMobile: mobile && !tablet,
    isTablet: tablet,
    isDesktop: !mobile && !tablet,
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' as const : 'portrait' as const,
    userAgent: navigator.userAgent,
  };
}

/**
 * Listen for orientation changes
 */
export function onOrientationChange(callback: (orientation: 'portrait' | 'landscape') => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => {
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    callback(orientation);
  };

  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', handler);

  return () => {
    window.removeEventListener('resize', handler);
    window.removeEventListener('orientationchange', handler);
  };
}
