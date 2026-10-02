import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchPromotions, fetchTags } from '@/lib/api';
import { loadCategoryList, parseListSearchParams } from '@/lib/category-list';
import { CategoryListPage } from '@/components/content/CategoryListPage';
import { StaticCategoryList } from '@/components/content/StaticCategoryList';

export const metadata: Metadata = {
  title: 'Promosi & Diskon Mahasiswa',
  description:
    'Penawaran khusus, voucher edukasi, diskon, dan informasi mitra untuk mahasiswa.',
};

const FALLBACK_ERROR = 'Gagal memuat daftar promosi mahasiswa. Coba lagi nanti.';

export default async function PromosiListPage() {
  const params = parseListSearchParams(undefined);
  const initialData = await loadCategoryList(fetchPromotions, fetchTags, params, FALLBACK_ERROR);
  const firstPage = (
    <CategoryListPage
      type="PROMOSI"
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
      <StaticCategoryList type="PROMOSI" initialData={initialData} fallbackError={FALLBACK_ERROR} />
    </Suspense>
  );
}
