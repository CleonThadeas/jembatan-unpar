'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { TRUTHFUL_BLOCKERS } from '@/lib/constants';

interface TruthfulBlockersBannerProps {
  compact?: boolean;
}

export function TruthfulBlockersBanner({ compact = false }: TruthfulBlockersBannerProps) {
  const [isOpen, setIsOpen] = useState(!compact);

  if (TRUTHFUL_BLOCKERS.length === 0) {
    return null;
  }

  return (
    <aside
      className="bg-gold-50/70 border border-gold-200 rounded-xl p-4 text-ink-900 transition-shadow shadow-sm"
      aria-labelledby="blockers-heading"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 id="blockers-heading" className="text-sm font-semibold text-ink-900">
              Keterbukaan Teknis & Batasan Layanan
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Fitur pelaporan kondisi kampus berjalan pada layanan yang dioperasikan tim mahasiswa. Perhatikan batasan operasional berikut:
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] flex-shrink-0 text-ink-600 hover:text-ink-900 rounded hover:bg-gold-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600"
          aria-expanded={isOpen}
          aria-controls="blockers-content"
          aria-label={isOpen ? 'Ciutkan informasi batasan sistem' : 'Buka informasi batasan sistem'}
        >
          {isOpen ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div id="blockers-content" className="mt-3.5 pt-3 border-t border-gold-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {TRUTHFUL_BLOCKERS.map((item) => (
            <div key={item.id} className="bg-white/80 p-2.5 rounded-lg border border-gold-200">
              <div className="flex items-center space-x-1.5 font-semibold text-ink-900 mb-1">
                <Info className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" aria-hidden="true" />
                <span>{item.title}</span>
              </div>
              <p className="text-ink-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
