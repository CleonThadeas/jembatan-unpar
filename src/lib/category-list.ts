import { ApiError, isContentAvailability, isContentSort } from '@/lib/api';
import type {
  Content,
  ContentAvailability,
  ContentFilterParams,
  ContentListResponse,
  ContentSort,
  PaginationMeta,
  Tag,
} from '@/types/content';

const PER_PAGE = 10;
const DEFAULT_SORT: ContentSort = 'published_at_desc';

export interface ListSearchParams {
  q?: string;
  tag?: string;
  sort?: string;
  availability?: string;
  page?: string;
}

export interface ParsedListParams {
  q: string;
  tag: string;
  sort: ContentSort;
  availability?: ContentAvailability;
  page: number;
}

export interface CategoryListData {
  contents: Content[];
  pagination: PaginationMeta;
  tags: Tag[];
  error: string | null;
}

// URL search params are untrusted: unsupported sort values and invalid pages fall back to defaults.
export function parseListSearchParams(searchParams: ListSearchParams | undefined): ParsedListParams {
  const rawPage = searchParams?.page ?? '';
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  return {
    q: searchParams?.q ?? '',
    tag: searchParams?.tag ?? '',
    sort: isContentSort(searchParams?.sort) ? searchParams.sort : DEFAULT_SORT,
    availability: isContentAvailability(searchParams?.availability) ? searchParams.availability : undefined,
    page: page >= 1 ? page : 1,
  };
}

function emptyPagination(page: number): PaginationMeta {
  return { page, total_items: 0, total_pages: 0, has_next: false, has_prev: false };
}

export async function loadCategoryList(
  fetchList: (params: ContentFilterParams) => Promise<ContentListResponse>,
  fetchTags: () => Promise<Tag[]>,
  { q, tag, sort, availability, page }: ParsedListParams,
  fallbackError: string
): Promise<CategoryListData> {
  try {
    const [listRes, rawApiTags] = await Promise.all([
      fetchList({ q, tag, sort, availability, page, per_page: PER_PAGE }),
      fetchTags().catch((error: unknown) => {
        console.warn('[loadCategoryList] tags failed, continuing without them', error);
        return [] as Tag[];
      }),
    ]);

    const contents = Array.isArray(listRes?.data) ? listRes.data : [];
    const apiTags = Array.isArray(rawApiTags) ? rawApiTags : [];

    // Dedupe by slug; API entries win
    const tagMap = new Map<string, Tag>();

    for (const t of apiTags) {
      if (t && typeof t.slug === 'string' && t.slug && !tagMap.has(t.slug)) {
        tagMap.set(t.slug, t);
      }
    }

    for (const content of contents) {
      if (Array.isArray(content.tags)) {
        for (const t of content.tags) {
          if (t && typeof t.slug === 'string' && t.slug && !tagMap.has(t.slug)) {
            tagMap.set(t.slug, t);
          }
        }
      }
    }

    // Ensure active tag filter from params appears even if not present in API or contents
    const activeTagSlug = tag?.trim();
    if (activeTagSlug && !tagMap.has(activeTagSlug)) {
      tagMap.set(activeTagSlug, {
        id: activeTagSlug,
        name: activeTagSlug,
        slug: activeTagSlug,
      });
    }

    // Sort by name with localeCompare('id'), returning a new array (immutable)
    const mergedTags = Array.from(tagMap.values()).sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', 'id')
    );

    return {
      contents,
      pagination: listRes?.pagination ?? emptyPagination(page),
      tags: mergedTags,
      error: null,
    };
  } catch (err: unknown) {
    // ApiError messages are already user-safe; anything else may contain internal hosts.
    const error = err instanceof ApiError ? err.message : fallbackError;
    return { contents: [], pagination: emptyPagination(page), tags: [], error };
  }
}
