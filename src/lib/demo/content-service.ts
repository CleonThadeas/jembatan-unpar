import {
  Content,
  ContentFilterParams,
  ContentListResponse,
  ContentType,
  Tag,
} from '@/types/content';
import { isContentExpired } from '@/lib/expiry';
import { getDemoReferenceDate } from './content-clock';
import { DEMO_CONTENT_ITEMS, DEMO_TAGS } from './content-fixtures';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 50;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Filter, sort, and paginate demo content items in memory.
 */
export function queryDemoContent(
  type: ContentType,
  params: ContentFilterParams = {}
): ContentListResponse {
  const refDate = getDemoReferenceDate();

  // 1. Filter by category type
  let items = DEMO_CONTENT_ITEMS.filter((item) => item.type === type);

  // 2. Filter by availability (aktif vs berakhir)
  if (params.availability === 'aktif') {
    items = items.filter((item) => !isContentExpired(item, refDate));
  } else if (params.availability === 'berakhir') {
    items = items.filter((item) => isContentExpired(item, refDate));
  }

  // 3. Filter by search query q
  if (params.q && params.q.trim()) {
    const qLower = params.q.trim().toLowerCase();
    items = items.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(qLower);
      const summaryMatch = item.summary.toLowerCase().includes(qLower);
      const bodyMatch = item.body.toLowerCase().includes(qLower);
      const organizerMatch = item.organizer.toLowerCase().includes(qLower);
      const tagMatch = item.tags?.some((t) => t.name.toLowerCase().includes(qLower));
      return titleMatch || summaryMatch || bodyMatch || organizerMatch || tagMatch;
    });
  }

  // 4. Filter by tag slug
  if (params.tag && params.tag.trim()) {
    const tagSlug = params.tag.trim().toLowerCase();
    items = items.filter((item) =>
      item.tags?.some((t) => t.slug.toLowerCase() === tagSlug)
    );
  }

  // 5. Sorting
  const sort = params.sort ?? 'published_at_desc';
  items = [...items].sort((a, b) => {
    switch (sort) {
      case 'published_at_asc': {
        const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return timeA - timeB;
      }
      case 'views_desc':
        return b.view_count - a.view_count;
      case 'created_at_desc': {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeB - timeA;
      }
      case 'published_at_desc':
      default: {
        const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return timeB - timeA;
      }
    }
  });

  // 6. Pagination
  const total_items = items.length;
  const rawPage = typeof params.page === 'number' && params.page >= 1 ? params.page : 1;
  const rawPerPage =
    typeof params.per_page === 'number' && params.per_page >= 1
      ? Math.min(params.per_page, MAX_PER_PAGE)
      : DEFAULT_PER_PAGE;

  const total_pages = total_items === 0 ? 0 : Math.ceil(total_items / rawPerPage);
  const page = total_pages === 0 ? 1 : Math.min(rawPage, total_pages);
  const per_page = rawPerPage;

  const startIndex = (page - 1) * per_page;
  const paginatedData = items.slice(startIndex, startIndex + per_page);

  return {
    data: paginatedData,
    pagination: {
      page,
      per_page,
      total_items,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    },
  };
}

/**
 * Lookup single content item by category and slug.
 * Validates slug format and returns 404 ApiError if not found.
 */
export function getDemoContentBySlug(type: ContentType, slug: string): Content {
  if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug.trim())) {
    throw new ApiError('Format slug tidak valid.', 404, 'NOT_FOUND');
  }

  const normalizedSlug = slug.trim().toLowerCase();
  const found = DEMO_CONTENT_ITEMS.find(
    (item) => item.type === type && item.slug.toLowerCase() === normalizedSlug
  );

  if (!found) {
    throw new ApiError('Konten tidak ditemukan.', 404, 'NOT_FOUND');
  }

  return found;
}

/**
 * Returns all unique tags.
 */
export function getDemoTags(): Tag[] {
  return DEMO_TAGS;
}

/**
 * Returns array of slugs for a given category.
 * Used by generateStaticParams in category [slug]/page.tsx.
 */
export function getDemoSlugsByCategory(type: ContentType): string[] {
  return DEMO_CONTENT_ITEMS.filter((item) => item.type === type).map((item) => item.slug);
}
