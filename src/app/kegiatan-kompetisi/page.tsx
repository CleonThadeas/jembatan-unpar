import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchActivities, fetchTags } from '@/lib/api';
import { loadCategoryList, parseListSearchParams } from '@/lib/category-list';
import { CategoryListPage } from '@/components/content/CategoryListPage';
import { StaticCategoryList } from '@/components/content/StaticCategoryList';

export const metadata: Metadata = {
  title: 'Kegiatan & Kompetisi Mahasiswa',
  description:
    'Informasi kompetisi ilmiah, lomba inovasi, hackathon, dan kegiatan pengembangan mahasiswa.',
};

const FALLBACK_ERROR = 'Gagal memuat daftar kegiatan dan kompetisi. Coba lagi nanti.';

export default async function KegiatanKompetisiListPage() {
  const params = parseListSearchParams(undefined);
  const initialData = await loadCategoryList(fetchActivities, fetchTags, params, FALLBACK_ERROR);
  const firstPage = (
    <CategoryListPage
      type="KEGIATAN_KOMPETISI"
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
      <StaticCategoryList type="KEGIATAN_KOMPETISI" initialData={initialData} fallbackError={FALLBACK_ERROR} />
    </Suspense>
  );
}
