'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ContentType } from '@/types/content';
import { fetchActivities, fetchEvents, fetchPromotions, fetchScholarships, fetchTags } from '@/lib/api';
import { loadCategoryList, parseListSearchParams, type CategoryListData, type ParsedListParams } from '@/lib/category-list';
import { CategoryListPage } from './CategoryListPage';

const FETCHERS = {
  BEASISWA: fetchScholarships,
  EVENT: fetchEvents,
  KEGIATAN_KOMPETISI: fetchActivities,
  PROMOSI: fetchPromotions,
} as const;

interface StaticCategoryListProps {
  type: ContentType;
  initialData: CategoryListData;
  fallbackError: string;
}

interface LoadedList {
  key: string;
  params: ParsedListParams;
  data: CategoryListData;
}

/**
 * Static export cannot read searchParams on the server, so the build renders
 * the unfiltered first page and this component re-queries the local fixtures
 * whenever the URL query changes in the browser.
 */
export function StaticCategoryList({ type, initialData, fallbackError }: StaticCategoryListProps) {
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const params = parseListSearchParams({
    q: searchParams.get('q') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    availability: searchParams.get('availability') ?? undefined,
    page: searchParams.get('page') ?? undefined,
  });
  const [loaded, setLoaded] = useState<LoadedList>({ key: '', params, data: initialData });

  useEffect(() => {
    if (queryKey === '') {
      setLoaded({ key: '', params, data: initialData });
      return;
    }
    let cancelled = false;
    loadCategoryList(FETCHERS[type], fetchTags, params, fallbackError).then((data) => {
      if (!cancelled) setLoaded({ key: queryKey, params, data });
    });
    return () => {
      cancelled = true;
    };
    // params is derived from queryKey; re-running on queryKey alone is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, type, fallbackError, initialData]);

  const current = loaded.key === queryKey ? loaded : null;
  const data = current?.data ?? initialData;
  const shown = current?.params ?? params;

  return (
    <div aria-busy={current === null}>
      <CategoryListPage
        type={type}
        contents={data.contents}
        pagination={data.pagination}
        tags={data.tags}
        currentQuery={shown.q}
        currentTag={shown.tag}
        currentSort={shown.sort}
        currentAvailability={shown.availability}
        error={data.error}
      />
    </div>
  );
}
