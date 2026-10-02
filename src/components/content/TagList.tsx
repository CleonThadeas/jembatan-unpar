import React from 'react';
import Link from 'next/link';
import { Tag } from '@/types/content';

export interface TagListProps {
  tags?: Tag[];
  categorySlug: string;
  className?: string;
}

export interface TagVariantStyle {
  pill: string;
  hash: string;
}

export const TAG_VARIANTS: readonly TagVariantStyle[] = [
  {
    // Variant 0: Solid soft navy
    pill: 'bg-brand-50 text-brand-900 border-brand-200 hover:bg-brand-100 hover:border-brand-300',
    hash: 'text-brand-700 font-bold',
  },
  {
    // Variant 1: Gold soft
    pill: 'bg-gold-50 text-amber-950 border-gold-300/80 hover:bg-gold-100 hover:border-gold-400',
    hash: 'text-gold-700 font-bold',
  },
  {
    // Variant 2: Outline navy on crisp white
    pill: 'bg-white text-brand-800 border-brand-300 hover:bg-brand-50/70 hover:border-brand-400',
    hash: 'text-brand-700 font-bold',
  },
  {
    // Variant 3: Soft neutral with gold hash
    pill: 'bg-surface-50 text-slate-800 border-slate-300/80 hover:bg-slate-100 hover:border-slate-400',
    hash: 'text-gold-600 font-bold',
  },
] as const;

export function getTagVariant(tagSlug: string, index?: number): TagVariantStyle {
  if (typeof index === 'number') {
    return TAG_VARIANTS[index % TAG_VARIANTS.length];
  }
  let hash = 0;
  for (let i = 0; i < tagSlug.length; i++) {
    hash = (hash * 31 + tagSlug.charCodeAt(i)) >>> 0;
  }
  return TAG_VARIANTS[hash % TAG_VARIANTS.length];
}

export function TagList({ tags, categorySlug, className = '' }: TagListProps): React.JSX.Element | null {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {tags.map((tag, index) => {
        const variant = getTagVariant(tag.slug, index);
        const encodedSlug = encodeURIComponent(tag.slug);

        return (
          <Link
            key={tag.id || `${tag.slug}-${index}`}
            href={`/${categorySlug}?tag=${encodedSlug}`}
            className={`inline-flex items-center gap-1 min-h-[32px] px-3 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-1 break-words [overflow-wrap:anywhere] ${variant.pill}`}
          >
            <span className={variant.hash} aria-hidden="true">
              #
            </span>
            <span>{tag.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
