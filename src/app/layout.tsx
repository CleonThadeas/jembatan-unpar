import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DemoBanner } from '@/components/demo/DemoBanner';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SkipToContent } from '@/components/layout/SkipToContent';
import { RouteProgress } from '@/components/layout/RouteProgress';
import { FirstVisitSplash } from '@/components/layout/FirstVisitSplash';
import { SPLASH_SESSION_KEY } from '@/lib/splash';

export const metadata: Metadata = {
  title: { default: 'JEMBATAN Prototype', template: '%s | Prototype JEMBATAN' },
  description: 'Prototype mahasiswa tidak resmi. Seluruh informasi dan laporan adalah simulasi; tidak mengirim laporan atau email nyata.',
  robots: { index: false, follow: false },
};

// Runs before first paint so repeat visits / reduced-motion users never see a
// flash of the server-rendered splash. Static string with no user input.
const SPLASH_GATE_SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('${SPLASH_SESSION_KEY}')!==null||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){d.dataset.splash='off'}}catch(e){d.dataset.splash='off'}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the gate script may add data-splash to <html>
    // before React hydrates.
    <html lang="id" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_GATE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased text-ink-900 bg-surface-50">
        <FirstVisitSplash />
        <Suspense fallback={null}><RouteProgress /></Suspense>
        <SkipToContent />
        <DemoBanner />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
