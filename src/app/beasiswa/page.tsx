import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchScholarships, fetchTags } from '@/lib/api';
import { loadCategoryList, parseListSearchParams } from '@/lib/category-list';
import { CategoryListPage } from '@/components/content/CategoryListPage';
import { StaticCategoryList } from '@/components/content/StaticCategoryList';

export const metadata: Metadata = {
  title: 'Beasiswa Mahasiswa',
  description:
    'Informasi beasiswa, bantuan dana pendidikan, dan peluang pendanaan riset yang dihimpun tim mahasiswa.',
};

const FALLBACK_ERROR = 'Gagal memuat daftar beasiswa. Coba lagi nanti.';

export default async function BeasiswaListPage() {
  const params = parseListSearchParams(undefined);
  const initialData = await loadCategoryList(fetchScholarships, fetchTags, params, FALLBACK_ERROR);
  const firstPage = (
    <CategoryListPage
      type="BEASISWA"
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
      <StaticCategoryList type="BEASISWA" initialData={initialData} fallbackError={FALLBACK_ERROR} />
    </Suspense>
  );
}
