import type { Content, ContentFilterParams, ContentListResponse } from '@/types/content';
import { isContentExpired } from '@/lib/expiry';

export const HOME_PER_PAGE = 3;
export const HOME_FETCH_PER_PAGE = 6;

type ListFetcher = (params: ContentFilterParams) => Promise<ContentListResponse>;

export interface HomeFetchers {
  scholarships: ListFetcher;
  events: ListFetcher;
  activities: ListFetcher;
  promotions: ListFetcher;
}

export interface HighlightSection {
  items: Content[];
  failed: boolean;
}

export interface HomeHighlights {
  scholarships: HighlightSection;
  events: HighlightSection;
  activities: HighlightSection;
  promotions: HighlightSection;
  allFailed: boolean;
}

// A failed or malformed response is flagged, never collapsed into an empty list,
// so the page can tell "no published content" apart from "backend unreachable".
async function loadSection(fetchList: ListFetcher): Promise<HighlightSection> {
  try {
    const res = await fetchList({
      per_page: HOME_FETCH_PER_PAGE,
      availability: 'aktif',
      sort: 'published_at_desc',
    });
    const rawItems = Array.isArray(res?.data)
      ? res.data
      : res && res.data === null && res.pagination
        ? []
        : null;
    if (rawItems === null) {
      return { items: [], failed: true };
    }
    const items = rawItems.filter((item) => !isContentExpired(item)).slice(0, HOME_PER_PAGE);
    return { items, failed: false };
  } catch {
    return { items: [], failed: true };
  }
}

export async function loadHomeHighlights(fetchers: HomeFetchers): Promise<HomeHighlights> {
  const [scholarships, events, activities, promotions] = await Promise.all([
    loadSection(fetchers.scholarships),
    loadSection(fetchers.events),
    loadSection(fetchers.activities),
    loadSection(fetchers.promotions),
  ]);
  const allFailed = [scholarships, events, activities, promotions].every((s) => s.failed);
  return { scholarships, events, activities, promotions, allFailed };
}
