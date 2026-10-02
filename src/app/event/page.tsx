import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchEvents, fetchTags } from '@/lib/api';
import { loadCategoryList, parseListSearchParams } from '@/lib/category-list';
import { CategoryListPage } from '@/components/content/CategoryListPage';
import { StaticCategoryList } from '@/components/content/StaticCategoryList';

export const metadata: Metadata = {
  title: 'Event & Agenda Kampus',
  description:
    'Jadwal seminar, workshop, webinar, dan agenda kegiatan kemahasiswaan kampus.',
};

const FALLBACK_ERROR = 'Gagal memuat agenda event kampus. Coba lagi nanti.';

export default async function EventListPage() {
  const params = parseListSearchParams(undefined);
  const initialData = await loadCategoryList(fetchEvents, fetchTags, params, FALLBACK_ERROR);
  const firstPage = (
    <CategoryListPage
      type="EVENT"
      contents={initialData.contents}
      pagination={initialData.pagination}
      tags={initialData.tags}
      currentQuery={params.q}
      currentTag={params.tag}
      currentSort={params.sort}
      currentAvailability={params.availability}
      error={initialData.error}
    />
  );
  return (
    <Suspense fallback={firstPage}>
      <StaticCategoryList type="EVENT" initialData={initialData} fallbackError={FALLBACK_ERROR} />
    </Suspense>
  );
}
