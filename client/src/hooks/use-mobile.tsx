/**
 * @fileoverview Mobile Device Detection Hook
 * 
 * React hook that detects whether the current viewport is mobile-sized.
 * Uses matchMedia for efficient resize detection without polling.
 * 
 * @breakpoint 768px (standard tablet/mobile boundary)
 * 
 * @example
 * const isMobile = useIsMobile();
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 */

import * as React from "react"

/** Viewport width threshold for mobile detection */
const MOBILE_BREAKPOINT = 768

/**
 * Hook that returns true when viewport is below mobile breakpoint.
 * Uses matchMedia listener for efficient updates on resize.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
