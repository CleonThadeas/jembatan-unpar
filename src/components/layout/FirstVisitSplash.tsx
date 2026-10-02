'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { BRAND_TAGLINE } from '@/lib/brand';
import { SPLASH_SESSION_KEY } from '@/lib/splash';
// Keep in sync with the `splash-progress` animation and `splash-dismiss`
// delay in globals.css.
const SPLASH_VISIBLE_MS = 3000;
const SPLASH_FADE_MS = 300;

export function FirstVisitSplash(): React.JSX.Element | null {
  // Starts visible so the server-rendered HTML already contains the overlay and
  // it paints before the page. Repeat visits are hidden pre-paint by the gate
  // script in layout.tsx; this effect then removes the node from the tree.
  const [mounted, setMounted] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  // StrictMode re-runs effects on the same instance; without this guard the
  // second run sees the flag we just wrote and hides the splash immediately.
  const gateCheckedRef = useRef(false);

  useEffect(() => {
    if (gateCheckedRef.current) return;
    gateCheckedRef.current = true;

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) !== null;
      if (!alreadySeen) window.sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
    } catch (error: unknown) {
      // Storage can be blocked (private mode, sandboxed iframe, quota). Without
      // it we cannot remember the visit, so skip the splash rather than show it
      // on every page load.
      console.warn('[FirstVisitSplash] sessionStorage unavailable, skipping splash', error);
      setMounted(false);
      return;
    }

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    if (alreadySeen || prefersReducedMotion) setMounted(false);
  }, []);

  // Timers live in their own effects so StrictMode's cleanup/re-run restarts
  // them instead of stranding the splash.
  useEffect(() => {
    if (!mounted || fadingOut) return;
    const fadeTimer = setTimeout(() => setFadingOut(true), SPLASH_VISIBLE_MS);
    return () => clearTimeout(fadeTimer);
  }, [mounted, fadingOut]);

  useEffect(() => {
    if (!fadingOut) return;
    const unmountTimer = setTimeout(() => setMounted(false), SPLASH_FADE_MS);
    return () => clearTimeout(unmountTimer);
  }, [fadingOut]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="first-visit-splash"
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-brand-950 text-white transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center px-6 select-none">
        <BrandLogo className="h-14 sm:h-16 w-auto mb-6" priority />
        <p className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          JEMBATAN<span className="text-gold-500">.</span>
        </p>
        <p className="text-xs sm:text-sm uppercase tracking-wider text-gold-400 font-semibold mb-6 max-w-xs sm:max-w-sm text-balance">
          {BRAND_TAGLINE}
        </p>
        <div
          data-testid="first-visit-splash-progress"
          className="relative w-40 sm:w-56 h-[3px] rounded-full bg-white/15 overflow-hidden"
        >
          <div className="absolute inset-0 rounded-full bg-gold-500 splash-progress motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
