'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

/** The page's smooth-scroll instance (null when the visitor prefers reduced motion). */
export const useLenis = () => useContext(LenisContext);

/**
 * Smooth scrolling for the whole site, driven by GSAP's ticker so ScrollTrigger
 * scenes stay in sync with the scroll position.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  // Web fonts change text size: re-measure the scroll scenes once, if they were still loading.
  // (ScrollTrigger refreshes on window load by itself, and every refresh re-measures all scenes, which is costly.)
  useEffect(() => {
    if (!document.fonts || document.fonts.status === 'loaded') return;
    let alive = true;
    document.fonts.ready.then(() => alive && ScrollTrigger.refresh());
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Phones: the address bar showing/hiding changes the screen height; re-measuring every scroll scene then
    // makes the page jump, so ScrollTrigger ignores those resizes.
    ScrollTrigger.config({ ignoreMobileResize: true });
    // Touch screens: Lenis also smooths finger scrolling (syncTouch), so the pinned home scenes glide with
    // the same gentle inertia as on desktop instead of jumping with every flick.
    // touchMultiplier: each swipe travels further on phones, so the home scenes need less finger work
    const instance = new Lenis({ lerp: 0.085, syncTouch: true, syncTouchLerp: 0.09, touchInertiaExponent: 1.5, touchMultiplier: 1.7 });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/** Scrolls smoothly when Lenis is active, natively otherwise. */
export function scrollToY(lenis: Lenis | null, y: number, duration = 1.6) {
  if (lenis) lenis.scrollTo(y, { duration });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
