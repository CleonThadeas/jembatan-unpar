import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'Belum Ada Informasi yang Sesuai',
  description = 'Coba gunakan kata kunci lain atau ubah filter pencarian Anda.',
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-sm my-6"
    >
      {/* Calm icon without background shape / circular box */}
      <SearchX className="w-8 h-8 text-slate-400 mb-3" aria-hidden="true" />
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">{title}</h2>
      <p className="text-sm text-slate-600 max-w-md leading-relaxed">{description}</p>
    </div>
  );
}
