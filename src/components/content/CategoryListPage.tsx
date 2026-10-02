import React from 'react';
import { Content, ContentType, PaginationMeta, Tag, CATEGORIES } from '@/types/content';
import { FilterBar } from './FilterBar';
import { ContentGrid } from './ContentGrid';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Pagination } from './Pagination';
import {
  GraduationCap,
  Calendar,
  Trophy,
  Tag as TagIcon,
} from 'lucide-react';

interface CategoryListPageProps {
  type: ContentType;
  contents: Content[];
  pagination: PaginationMeta;
  tags: Tag[];
  currentQuery?: string;
  currentTag?: string;
  currentSort?: string;
  currentAvailability?: string;
  error?: string | null;
}

const CATEGORY_ICONS = {
  BEASISWA: GraduationCap,
  EVENT: Calendar,
  KEGIATAN_KOMPETISI: Trophy,
  PROMOSI: TagIcon,
};

export function CategoryListPage({
  type,
  contents,
  pagination,
  tags,
  currentQuery = '',
  currentTag = '',
  currentSort = 'published_at_desc',
  currentAvailability = '',
  error,
}: CategoryListPageProps): React.JSX.Element {
  const category = CATEGORIES[type];
  const Icon = CATEGORY_ICONS[type] || GraduationCap;

  const retryParams = new URLSearchParams();
  if (currentQuery) retryParams.set('q', currentQuery);
  if (currentTag) retryParams.set('tag', currentTag);
  if (currentSort && currentSort !== 'published_at_desc') retryParams.set('sort', currentSort);
  if (currentAvailability) retryParams.set('availability', currentAvailability);
  const retryQs = retryParams.toString();
  const retryHref = retryQs ? `/${category.slug}?${retryQs}` : `/${category.slug}`;

  const hasFiltersActive = Boolean(
    currentQuery ||
      currentTag ||
      (currentSort && currentSort !== 'published_at_desc') ||
      currentAvailability
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Category Header: icon only without background box/shape */}
      <header className="mb-8">
        <div className="flex items-start sm:items-center gap-3.5 mb-2">
          <Icon className="w-9 h-9 text-brand-800 flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
              {category.label}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">{category.description}</p>
          </div>
        </div>
      </header>

      {/* Filter Bar: keyed on URL filters including availability */}
      <FilterBar
        key={`${currentQuery}|${currentTag}|${currentSort}|${currentAvailability}`}
        tags={tags}
        initialQuery={currentQuery}
        initialTag={currentTag}
        initialSort={currentSort}
        initialAvailability={currentAvailability}
      />

      {/* Content Rendering */}
      {error ? (
        <ErrorState
          title={`Gagal Memuat Daftar ${category.label}`}
          message={error}
          retryHref={retryHref}
        />
      ) : contents.length === 0 ? (
        <EmptyState
          title={
            hasFiltersActive
              ? 'Belum Ada Informasi yang Sesuai'
              : `Belum Ada Informasi ${category.label}`
          }
          description={
            hasFiltersActive
              ? 'Coba gunakan kata kunci lain atau ubah filter pencarian Anda.'
              : 'Belum ada informasi untuk saat ini. Nantikan pembaruan berikutnya.'
          }
        />
      ) : (
        <>
          {/* Friendly result-count text */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 mb-4 px-0.5">
            <p>
              Menampilkan{' '}
              <strong className="font-semibold text-slate-900">{pagination.total_items}</strong>{' '}
              informasi {category.label.toLowerCase()}
              {currentAvailability === 'aktif' && ' yang masih aktif'}
              {currentAvailability === 'berakhir' && ' yang telah berakhir'}
              {currentQuery && (
                <>
                  {' '}untuk kata kunci &ldquo;<span className="font-medium text-slate-800">{currentQuery}</span>&rdquo;
                </>
              )}
            </p>
          </div>

          <ContentGrid contents={contents} />

          <Pagination
            pagination={pagination}
            basePath={`/${category.slug}`}
            queryParams={{
              q: currentQuery,
              tag: currentTag,
              sort: currentSort,
              availability: currentAvailability,
            }}
          />
        </>
      )}
    </div>
  );
}
