import React from 'react';
import Link from 'next/link';

export interface ReportPageHeaderProps {
  title: string;
  description?: React.ReactNode;
  guideHref?: string;
  className?: string;
}

export function ReportPageHeader({
  title,
  description,
  guideHref,
  className = '',
}: ReportPageHeaderProps): React.JSX.Element {
  return (
    <div className={`space-y-2 text-left ${className}`.trim()}>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-700 tracking-tight text-balance">
        {title}
      </h1>
      {description && (
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
      {guideHref && (
        <div className="pt-0.5">
          <Link
            href={guideHref}
            className="min-h-12 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-800 transition hover:underline"
          >
            <span>Pelajari Panduan &amp; Batasan Layanan</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
