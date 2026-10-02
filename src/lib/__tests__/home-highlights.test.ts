import { describe, it, expect, vi } from 'vitest';
import { loadHomeHighlights, HOME_PER_PAGE, HOME_FETCH_PER_PAGE } from '@/lib/home-highlights';
import type { Content, ContentListResponse } from '@/types/content';

const item = { id: 'c1', slug: 'kip-2026', title: 'KIP 2026' } as Content;
const ok = (data: Content[]): ContentListResponse => ({
  data,
  pagination: { page: 1, total_items: data.length, total_pages: 1, has_next: false, has_prev: false },
});

describe('loadHomeHighlights', () => {
  it('requests active items sorted newest with fetch per_page limit', async () => {
    const fetchScholarships = vi.fn().mockResolvedValue(ok([item]));
    const resolved = vi.fn().mockResolvedValue(ok([]));

    await loadHomeHighlights({
      scholarships: fetchScholarships,
      events: resolved,
      activities: resolved,
      promotions: resolved,
    });

    expect(fetchScholarships).toHaveBeenCalledWith({
      per_page: HOME_FETCH_PER_PAGE,
      availability: 'aktif',
      sort: 'published_at_desc',
    });
  });

  it('filters out expired items defensively even if backend returns them', async () => {
    const expiredItem1 = {
      id: 'exp-1',
      type: 'BEASISWA',
      title: 'Beasiswa Kadaluarsa',
      slug: 'beasiswa-kadaluarsa',
      registration_deadline: '2020-01-01T00:00:00Z',
    } as Content;

    const activeItem = {
      id: 'act-1',
      type: 'BEASISWA',
      title: 'Beasiswa Aktif',
      slug: 'beasiswa-aktif',
      registration_deadline: '2099-01-01T00:00:00Z',
    } as Content;

    const expiredItem2 = {
      id: 'exp-2',
      type: 'EVENT',
      title: 'Event Lewat',
      slug: 'event-lewat',
      event_start_at: '2020-01-01T00:00:00Z',
      event_end_at: '2020-01-02T00:00:00Z',
    } as Content;

    const result = await loadHomeHighlights({
      scholarships: async () => ok([expiredItem1, activeItem, expiredItem2]),
      events: async () => ok([]),
      activities: async () => ok([]),
      promotions: async () => ok([]),
    });

    expect(result.scholarships.failed).toBe(false);
    expect(result.scholarships.items).toEqual([activeItem]);
  });

  it('caps items at HOME_PER_PAGE (3) after client-side filtering', async () => {
    const items = [1, 2, 3, 4, 5].map(
      (idx) =>
        ({
          id: `item-${idx}`,
          type: 'BEASISWA',
          title: `Beasiswa ${idx}`,
          slug: `beasiswa-${idx}`,
          registration_deadline: '2099-01-01T00:00:00Z',
        }) as Content
    );

    const result = await loadHomeHighlights({
      scholarships: async () => ok(items),
      events: async () => ok([]),
      activities: async () => ok([]),
      promotions: async () => ok([]),
    });

    expect(result.scholarships.items).toHaveLength(HOME_PER_PAGE);
    expect(result.scholarships.items.map((i) => i.id)).toEqual(['item-1', 'item-2', 'item-3']);
  });

  it('keeps successful categories and flags only the failed one', async () => {
    const result = await loadHomeHighlights({
      scholarships: async () => ok([item]),
      events: async () => {
        throw new Error('connect ECONNREFUSED 127.0.0.1:8080');
      },
      activities: async () => ok([]),
      promotions: async () => ok([]),
    });

    expect(result.scholarships).toEqual({ items: [item], failed: false });
    expect(result.events).toEqual({ items: [], failed: true });
    expect(result.activities).toEqual({ items: [], failed: false });
    expect(result.allFailed).toBe(false);
  });

  it('reports allFailed when every category fails', async () => {
    const fail = async (): Promise<ContentListResponse> => {
      throw new Error('boom');
    };

    const result = await loadHomeHighlights({ scholarships: fail, events: fail, activities: fail, promotions: fail });

    expect(result.allFailed).toBe(true);
  });

  it('treats a malformed body as a failure instead of an empty list', async () => {
    const malformed = async () => ({ data: null }) as unknown as ContentListResponse;

    const result = await loadHomeHighlights({
      scholarships: malformed,
      events: async () => ok([]),
      activities: async () => ok([]),
      promotions: async () => ok([]),
    });

    expect(result.scholarships).toEqual({ items: [], failed: true });
  });
});
