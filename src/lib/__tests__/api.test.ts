import { describe, it, expect } from 'vitest';
import {
  fetchScholarships,
  fetchScholarshipBySlug,
  fetchEvents,
  fetchEventBySlug,
  fetchActivities,
  fetchActivityBySlug,
  fetchPromotions,
  fetchPromotionBySlug,
  fetchTags,
  getApiBaseUrl,
  ApiError,
  isNotFoundError,
  isContentSort,
  isContentAvailability,
} from '../api';

describe('API Fixture Adapter: Error and Type Guards', () => {
  describe('isNotFoundError', () => {
    it('is true only for ApiError with status 404', () => {
      expect(isNotFoundError(new ApiError('Not found', 404, 'NOT_FOUND'))).toBe(true);
      expect(isNotFoundError(new ApiError('Server error', 500, 'INTERNAL_ERROR'))).toBe(false);
      expect(isNotFoundError(new ApiError('Unavailable', 503))).toBe(false);
      expect(isNotFoundError(new Error('404'))).toBe(false);
      expect(isNotFoundError(null)).toBe(false);
      expect(isNotFoundError(undefined)).toBe(false);
    });
  });

  describe('isContentSort', () => {
    it('returns true for whitelisted sort values', () => {
      expect(isContentSort('published_at_desc')).toBe(true);
      expect(isContentSort('published_at_asc')).toBe(true);
      expect(isContentSort('views_desc')).toBe(true);
      expect(isContentSort('created_at_desc')).toBe(true);
    });

    it('returns false for invalid sort values', () => {
      expect(isContentSort('invalid_sort')).toBe(false);
      expect(isContentSort('')).toBe(false);
      expect(isContentSort(undefined)).toBe(false);
      expect(isContentSort(123)).toBe(false);
    });
  });

  describe('isContentAvailability', () => {
    it('returns true for whitelisted availability values', () => {
      expect(isContentAvailability('aktif')).toBe(true);
      expect(isContentAvailability('berakhir')).toBe(true);
    });

    it('returns false for invalid availability values', () => {
      expect(isContentAvailability('all')).toBe(false);
      expect(isContentAvailability('')).toBe(false);
      expect(isContentAvailability(undefined)).toBe(false);
      expect(isContentAvailability(123)).toBe(false);
    });
  });

  describe('getApiBaseUrl', () => {
    it('returns a valid base URL string for backwards compatibility', () => {
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
      expect(url).toContain('/api/v1');
    });
  });
});

describe('API Fixture Adapter: Scholarships (Beasiswa)', () => {
  it('fetches scholarships list with default pagination', async () => {
    const res = await fetchScholarships();
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.pagination.total_items).toBe(12);
    expect(res.pagination.page).toBe(1);
    expect(res.pagination.per_page).toBe(10);
    expect(res.data).toHaveLength(10);
    expect(res.pagination.has_next).toBe(true);
  });

  it('fetches scholarships page 2 correctly', async () => {
    const res = await fetchScholarships({ page: 2 });
    expect(res.data).toHaveLength(2);
    expect(res.pagination.page).toBe(2);
    expect(res.pagination.has_next).toBe(false);
    expect(res.pagination.has_prev).toBe(true);
  });

  it('filters scholarships by availability: aktif returns 9 items', async () => {
    const res = await fetchScholarships({ availability: 'aktif', per_page: 50 });
    expect(res.data).toHaveLength(9);
    expect(res.pagination.total_items).toBe(9);
  });

  it('filters scholarships by availability: berakhir returns 3 items', async () => {
    const res = await fetchScholarships({ availability: 'berakhir', per_page: 50 });
    expect(res.data).toHaveLength(3);
    expect(res.pagination.total_items).toBe(3);
  });

  it('filters scholarships by query string q', async () => {
    const res = await fetchScholarships({ q: 'Prestasi' });
    expect(res.data.length).toBeGreaterThanOrEqual(1);
    for (const item of res.data) {
      const matches =
        item.title.toLowerCase().includes('prestasi') ||
        item.summary.toLowerCase().includes('prestasi') ||
        item.body.toLowerCase().includes('prestasi') ||
        item.tags?.some((t) => t.name.toLowerCase().includes('prestasi'));
      expect(matches).toBe(true);
    }
  });

  it('fetches scholarship detail by valid slug', async () => {
    const slug = 'beasiswa-prestasi-akademik-semester-genap';
    const detail = await fetchScholarshipBySlug(slug);
    expect(detail.slug).toBe(slug);
    expect(detail.type).toBe('BEASISWA');
    expect(detail.status).toBe('PUBLISHED');
  });

  it('throws 404 ApiError for missing scholarship slug', async () => {
    await expect(fetchScholarshipBySlug('beasiswa-tidak-ada')).rejects.toThrow(ApiError);
    const err = await fetchScholarshipBySlug('beasiswa-tidak-ada').catch((e) => e);
    expect(isNotFoundError(err)).toBe(true);
  });

  it.each(['../admin', 'Beasiswa Riset', 'a%2fb', ''])(
    'rejects malformed slug %j with 404',
    async (slug) => {
      const err = await fetchScholarshipBySlug(slug).catch((e) => e);
      expect(isNotFoundError(err)).toBe(true);
    }
  );
});

describe('API Fixture Adapter: Events', () => {
  it('fetches events list', async () => {
    const res = await fetchEvents({ per_page: 50 });
    expect(res.data).toHaveLength(12);
    expect(res.pagination.total_items).toBe(12);
  });

  it('filters events by availability: aktif (9) and berakhir (3)', async () => {
    const active = await fetchEvents({ availability: 'aktif', per_page: 50 });
    expect(active.data).toHaveLength(9);

    const expired = await fetchEvents({ availability: 'berakhir', per_page: 50 });
    expect(expired.data).toHaveLength(3);
  });

  it('fetches event detail by slug', async () => {
    const slug = 'seminar-nasional-keamanan-siber-dan-ai';
    const detail = await fetchEventBySlug(slug);
    expect(detail.slug).toBe(slug);
    expect(detail.type).toBe('EVENT');
  });

  it('throws 404 for unknown event slug', async () => {
    const err = await fetchEventBySlug('event-fiktif').catch((e) => e);
    expect(isNotFoundError(err)).toBe(true);
  });
});

describe('API Fixture Adapter: Activities & Competitions (Kegiatan)', () => {
  it('fetches activities list', async () => {
    const res = await fetchActivities({ per_page: 50 });
    expect(res.data).toHaveLength(12);
    expect(res.pagination.total_items).toBe(12);
  });

  it('filters activities by availability: aktif (9) and berakhir (3)', async () => {
    const active = await fetchActivities({ availability: 'aktif', per_page: 50 });
    expect(active.data).toHaveLength(9);

    const expired = await fetchActivities({ availability: 'berakhir', per_page: 50 });
    expect(expired.data).toHaveLength(3);
  });

  it('fetches activity detail by slug', async () => {
    const slug = 'hackathon-solusi-cerdas-kota-bandung';
    const detail = await fetchActivityBySlug(slug);
    expect(detail.slug).toBe(slug);
    expect(detail.type).toBe('KEGIATAN_KOMPETISI');
  });

  it('throws 404 for unknown activity slug', async () => {
    const err = await fetchActivityBySlug('kegiatan-fiktif').catch((e) => e);
    expect(isNotFoundError(err)).toBe(true);
  });
});

describe('API Fixture Adapter: Promotions (Promosi)', () => {
  it('fetches promotions list', async () => {
    const res = await fetchPromotions({ per_page: 50 });
    expect(res.data).toHaveLength(12);
    expect(res.pagination.total_items).toBe(12);
  });

  it('filters promotions by availability: aktif (9) and berakhir (3)', async () => {
    const active = await fetchPromotions({ availability: 'aktif', per_page: 50 });
    expect(active.data).toHaveLength(9);

    const expired = await fetchPromotions({ availability: 'berakhir', per_page: 50 });
    expect(expired.data).toHaveLength(3);
  });

  it('fetches promotion detail by slug', async () => {
    const slug = 'diskon-spesial-langganan-jurnal-dan-e-book-kampus';
    const detail = await fetchPromotionBySlug(slug);
    expect(detail.slug).toBe(slug);
    expect(detail.type).toBe('PROMOSI');
  });

  it('throws 404 for unknown promotion slug', async () => {
    const err = await fetchPromotionBySlug('promosi-fiktif').catch((e) => e);
    expect(isNotFoundError(err)).toBe(true);
  });
});

describe('API Fixture Adapter: Tags', () => {
  it('fetches all available unique tags', async () => {
    const tags = await fetchTags();
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags[0]).toHaveProperty('id');
    expect(tags[0]).toHaveProperty('name');
    expect(tags[0]).toHaveProperty('slug');
  });
});
