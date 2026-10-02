import React from 'react';

const SKELETON_CARDS = [0, 1, 2, 3, 4, 5];
const SKELETON_PILLS = [0, 1, 2, 3];

export default function Loading(): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <span className="sr-only">Memuat halaman…</span>
      <div aria-hidden="true" className="animate-pulse space-y-8 motion-reduce:animate-none">
        {/* Header Block Skeleton */}
        <div className="space-y-3">
          <div className="h-8 sm:h-9 w-64 rounded bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
          <div className="h-10 w-full sm:w-72 rounded-lg bg-slate-200" />
          <div className="flex flex-wrap gap-2">
            {SKELETON_PILLS.map((pill) => (
              <div key={pill} className="h-8 w-20 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>

        {/* Grid of 6 Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKELETON_CARDS.map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col h-full"
            >
              {/* Image thumbnail placeholder */}
              <div className="aspect-[16/9] w-full bg-slate-200" />
              {/* Card body */}
              <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/4 rounded bg-slate-200" />
                  </div>
                  <div className="h-5 w-4/5 rounded bg-slate-200" />
                  <div className="h-3.5 w-full rounded bg-slate-100" />
                  <div className="h-3.5 w-3/4 rounded bg-slate-100" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                  <div className="h-3 w-12 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
