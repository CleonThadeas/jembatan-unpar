'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const FADE_STEP_MS = 200;
const SAFETY_TIMEOUT_MS = 10000;

function RouteProgressBar(): React.JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  const locationKey = `${pathname}?${searchParams?.toString() ?? ''}`;
  const previousLocationRef = useRef(locationKey);
  const isActiveRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  const completeProgress = useCallback(() => {
    clearTimers();
    setProgress(1);

    timeoutRef.current = setTimeout(() => {
      setOpacity(0);
      timeoutRef.current = setTimeout(() => {
        isActiveRef.current = false;
        setIsActive(false);
        setProgress(0);
        setOpacity(1);
      }, FADE_STEP_MS);
    }, FADE_STEP_MS);
  }, [clearTimers]);

  const startProgress = useCallback(() => {
    clearTimers();
    isActiveRef.current = true;
    setIsActive(true);
    setOpacity(1);
    setProgress(0.15);

    // Smoothly progress to ~80%
    timeoutRef.current = setTimeout(() => {
      setProgress(0.8);
    }, 50);

    // Never leave the bar hanging if the navigation is cancelled or fails.
    safetyTimeoutRef.current = setTimeout(completeProgress, SAFETY_TIMEOUT_MS);
  }, [clearTimers, completeProgress]);

  // Complete only when the location actually changes, not when the bar starts.
  useEffect(() => {
    if (previousLocationRef.current === locationKey) return;
    previousLocationRef.current = locationKey;

    if (isActiveRef.current) {
      completeProgress();
    }
  }, [locationKey, completeProgress]);

  // Document-level internal link click and popstate listeners
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const targetEl = e.target as HTMLElement | SVGElement | null;
      const anchor = targetEl?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (anchor.hasAttribute('download')) return;

      const target = anchor.getAttribute('target');
      if (target && target !== '_self') return;

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;

        // Skip same page hash-only or exact same URL
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search
        ) {
          return;
        }

        startProgress();
      } catch {
        // Ignore invalid URL
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
    };
  }, [startProgress, clearTimers]);

  if (!isActive) return null;

  return (
    <div
      role="progressbar"
      aria-label="Memuat navigasi"
      aria-hidden="true"
      data-testid="route-progress"
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gold-500 origin-left transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
        style={{
          transform: `scaleX(${progress})`,
          opacity,
        }}
      />
    </div>
  );
}

export function RouteProgress(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <RouteProgressBar />
    </Suspense>
  );
}
