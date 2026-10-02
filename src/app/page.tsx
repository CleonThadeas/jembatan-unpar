import React from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryHighlights } from '@/components/home/CategoryHighlights';
import { fetchScholarships, fetchEvents, fetchActivities, fetchPromotions } from '@/lib/api';
import { loadHomeHighlights } from '@/lib/home-highlights';
import { AlertCircle } from 'lucide-react';
import { BRAND_FULL } from '@/lib/brand';

// The root layout's title template only applies to child segments, so the home page sets its full title explicitly.
export const metadata: Metadata = {
  title: { absolute: BRAND_FULL },
  description:
    'Temukan informasi pilihan tim mahasiswa UNPAR dan laporkan kondisi kampus yang membuat Anda tidak nyaman melalui inisiatif JEMBATAN.',
};


export default async function HomePage(): Promise<React.JSX.Element> {
  const highlights = await loadHomeHighlights({
    scholarships: fetchScholarships,
    events: fetchEvents,
    activities: fetchActivities,
    promotions: fetchPromotions,
  });

  return (
    <div className="space-y-12 pb-20">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {highlights.allFailed && (
          <div
            role="alert"
            className="mb-8 p-4 bg-gold-50 border border-gold-400 rounded-xl text-ink-900 text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-gold-700" aria-hidden="true" />
            <div>
              <p className="font-semibold">Informasi sedang dimuat ulang</p>
              <p className="text-xs text-ink-600">
                Kami sedang mengalami kendala menampilkan informasi terbaru. Silakan muat ulang halaman beberapa saat lagi.
              </p>
            </div>
          </div>
        )}

        <CategoryHighlights
          scholarships={highlights.scholarships}
          events={highlights.events}
          activities={highlights.activities}
          promotions={highlights.promotions}
        />
      </div>
    </div>
  );
}
