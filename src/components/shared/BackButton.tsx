'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  fallbackHref?: string;
}

export function BackButton({ className, fallbackHref = '/' }: BackButtonProps): React.JSX.Element {
  const router = useRouter();

  const handleClick = (): void => {
    // A directly opened tab has no history entry to return to.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
      Halaman Sebelumnya
    </button>
  );
}
