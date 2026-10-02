import React from 'react';
import Link from 'next/link';
import { PaginationMeta } from '@/types/content';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination: PaginationMeta;
  basePath: string;
  queryParams?: Record<string, string | undefined>;
}

export function Pagination({ pagination, basePath, queryParams = {} }: PaginationProps): React.JSX.Element | null {
  const { page, total_pages, total_items, has_next, has_prev } = pagination;

  if (total_pages <= 1 && total_items <= (pagination.per_page || 10)) {
    return null;
  }

  const buildUrl = (targetPage: number): string => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v);
    });
    params.set('page', targetPage.toString());
    return `${basePath}?${params.toString()}`;
  };

  // Generate page numbers to display (up to 5 pages around current)
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > total_pages) {
      end = total_pages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Navigasi Halaman"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 pb-4 border-t border-slate-200 mt-8"
    >
      <div className="text-xs text-slate-600">
        Menampilkan halaman <span className="font-semibold text-slate-700">{page}</span> dari{' '}
        <span className="font-semibold text-slate-700">{total_pages}</span> (Total{' '}
        <span className="font-semibold text-slate-700">{total_items}</span> konten)
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {/* Previous Button */}
        {has_prev ? (
          <Link
            href={buildUrl(page - 1)}
            className="flex items-center gap-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Ke halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="flex items-center gap-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-300 cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p) => {
            const isCurrent = p === page;
            return isCurrent ? (
              <span
                key={p}
                aria-current="page"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-brand-700 text-white text-xs font-semibold flex items-center justify-center shadow-sm"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={buildUrl(p)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={`Ke halaman ${p}`}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {has_next ? (
          <Link
            href={buildUrl(page + 1)}
            className="flex items-center gap-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Ke halaman berikutnya"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="flex items-center gap-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-300 cursor-not-allowed"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
