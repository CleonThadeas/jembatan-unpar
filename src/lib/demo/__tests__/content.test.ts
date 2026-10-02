import { describe, it, expect } from 'vitest';
import { getDemoReferenceDate, DEMO_REFERENCE_DATE_ISO } from '../content-clock';
import { DEMO_CONTENT_ITEMS, DEMO_TAGS } from '../content-fixtures';
import {
  queryDemoContent,
  getDemoContentBySlug,
  getDemoTags,
  getDemoSlugsByCategory,
} from '../content-service';
import { isContentExpired } from '@/lib/expiry';
import { ContentType } from '@/types/content';
import { generateStaticParams as beasiswaStaticParams } from '@/app/beasiswa/[slug]/page';
import { generateStaticParams as eventStaticParams } from '@/app/event/[slug]/page';
import { generateStaticParams as kegiatanStaticParams } from '@/app/kegiatan-kompetisi/[slug]/page';
import { generateStaticParams as promosiStaticParams } from '@/app/promosi/[slug]/page';
import { ApiError } from '@/lib/api';

describe('Demo Content System', () => {
  describe('Reference Clock', () => {
    it('defaults to 2026-10-02T12:00:00.000Z when env var is unset', () => {
      const originalEnv = process.env.NEXT_PUBLIC_DEMO_DATE;
      delete process.env.NEXT_PUBLIC_DEMO_DATE;
      try {
        const refDate = getDemoReferenceDate();
        expect(refDate.toISOString()).toBe('2026-10-02T12:00:00.000Z');
        expect(DEMO_REFERENCE_DATE_ISO).toBe('2026-10-02T12:00:00.000Z');
      } finally {
        if (originalEnv) process.env.NEXT_PUBLIC_DEMO_DATE = originalEnv;
      }
    });

    it('respects valid NEXT_PUBLIC_DEMO_DATE override', () => {
      const originalEnv = process.env.NEXT_PUBLIC_DEMO_DATE;
      process.env.NEXT_PUBLIC_DEMO_DATE = '2026-12-01T00:00:00.000Z';
      try {
        const refDate = getDemoReferenceDate();
        expect(refDate.toISOString()).toBe('2026-12-01T00:00:00.000Z');
      } finally {
        if (originalEnv) {
          process.env.NEXT_PUBLIC_DEMO_DATE = originalEnv;
        } else {
          delete process.env.NEXT_PUBLIC_DEMO_DATE;
        }
      }
    });
  });

  describe('Fixtures Inventory (48 items total, 12 per category)', () => {
    const categories: ContentType[] = ['BEASISWA', 'EVENT', 'KEGIATAN_KOMPETISI', 'PROMOSI'];

    it('contains exactly 48 items', () => {
      expect(DEMO_CONTENT_ITEMS).toHaveLength(48);
    });

    it.each(categories)('has exactly 12 items for category %s', (cat) => {
      const items = DEMO_CONTENT_ITEMS.filter((item) => item.type === cat);
      expect(items).toHaveLength(12);
    });

    it.each(categories)(
      'has exactly 9 active and 3 expired items for %s against demo clock',
      (cat) => {
        const refDate = new Date('2026-10-02T12:00:00.000Z');
        const items = DEMO_CONTENT_ITEMS.filter((item) => item.type === cat);
        const activeItems = items.filter((item) => !isContentExpired(item, refDate));
        const expiredItems = items.filter((item) => isContentExpired(item, refDate));

        expect(activeItems).toHaveLength(9);
        expect(expiredItems).toHaveLength(3);
      }
    );

    it('ensures all 48 slugs are unique, lower-kebab-case, and non-empty', () => {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      const slugs = new Set<string>();

      for (const item of DEMO_CONTENT_ITEMS) {
        expect(item.slug).toMatch(slugPattern);
        expect(slugs.has(item.slug)).toBe(false);
        slugs.add(item.slug);
      }
      expect(slugs.size).toBe(48);
    });

    it('ensures all items are PUBLISHED with non-empty titles and summaries', () => {
      for (const item of DEMO_CONTENT_ITEMS) {
        expect(item.status).toBe('PUBLISHED');
        expect(item.title.trim().length).toBeGreaterThan(5);
        expect(item.summary.trim().length).toBeGreaterThan(10);
        expect(item.body.trim().length).toBeGreaterThan(20);
        expect(item.organizer.trim().length).toBeGreaterThan(2);
      }
    });

    it('ensures registration links start with /demo/ and indicate simulation', () => {
      for (const item of DEMO_CONTENT_ITEMS) {
        if (item.registration_url) {
          expect(item.registration_url).toMatch(/^\/demo\//);
        }
      }
    });

    it('ensures hero images reference local demo images with descriptive alt text', () => {
      for (const item of DEMO_CONTENT_ITEMS) {
        if (item.hero_image_url) {
          expect(item.hero_image_url).toMatch(/\/images\/demo\/(library|workshop|graduation|laptop)\.jpg/);
          expect(item.hero_image_alt).toBeDefined();
          expect(item.hero_image_alt?.length).toBeGreaterThan(5);
        }
      }
    });
  });

  describe('Content Query & Service', () => {
    it('filters by availability: aktif returns 9 items for scholarships', () => {
      const res = queryDemoContent('BEASISWA', { availability: 'aktif' });
      expect(res.data).toHaveLength(9);
      expect(res.pagination.total_items).toBe(9);
    });

    it('filters by availability: berakhir returns 3 items for scholarships', () => {
      const res = queryDemoContent('BEASISWA', { availability: 'berakhir' });
      expect(res.data).toHaveLength(3);
      expect(res.pagination.total_items).toBe(3);
    });

    it('supports free-text search across title, summary, and organizer', () => {
      const res = queryDemoContent('EVENT', { q: 'Siber' });
      expect(res.data.length).toBeGreaterThanOrEqual(1);
      expect(res.data[0].title).toContain('Siber');
    });

    it('supports filtering by tag slug', () => {
      const res = queryDemoContent('BEASISWA', { tag: 'prestasi' });
      expect(res.data.length).toBeGreaterThanOrEqual(1);
      for (const item of res.data) {
        expect(item.tags?.some((t) => t.slug === 'prestasi')).toBe(true);
      }
    });

    it('paginates results correctly with per_page clamp', () => {
      const page1 = queryDemoContent('BEASISWA', { page: 1, per_page: 5 });
      expect(page1.data).toHaveLength(5);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.per_page).toBe(5);
      expect(page1.pagination.total_items).toBe(12);
      expect(page1.pagination.total_pages).toBe(3);
      expect(page1.pagination.has_next).toBe(true);
      expect(page1.pagination.has_prev).toBe(false);

      const page3 = queryDemoContent('BEASISWA', { page: 3, per_page: 5 });
      expect(page3.data).toHaveLength(2);
      expect(page3.pagination.has_next).toBe(false);
      expect(page3.pagination.has_prev).toBe(true);
    });

    it('sorts by views_desc', () => {
      const res = queryDemoContent('PROMOSI', { sort: 'views_desc' });
      for (let i = 1; i < res.data.length; i++) {
        expect(res.data[i - 1].view_count).toBeGreaterThanOrEqual(res.data[i].view_count);
      }
    });

    it('returns detail by slug for existing item', () => {
      const slug = DEMO_CONTENT_ITEMS[0].slug;
      const detail = getDemoContentBySlug('BEASISWA', slug);
      expect(detail.slug).toBe(slug);
    });

    it('throws 404 ApiError when slug is not found or malformed', () => {
      expect(() => getDemoContentBySlug('BEASISWA', 'slug-tidak-ada')).toThrow(ApiError);
      expect(() => getDemoContentBySlug('BEASISWA', 'Invalid Slug!')).toThrow(ApiError);
    });

    it('provides all unique tags', () => {
      const tags = getDemoTags();
      expect(tags.length).toBeGreaterThan(0);
      const slugs = tags.map((t) => t.slug);
      expect(new Set(slugs).size).toBe(tags.length);
    });

    it('provides 12 slugs per category for static generation', () => {
      const beasiswaSlugs = getDemoSlugsByCategory('BEASISWA');
      expect(beasiswaSlugs).toHaveLength(12);
      const eventSlugs = getDemoSlugsByCategory('EVENT');
      expect(eventSlugs).toHaveLength(12);
      const kegiatanSlugs = getDemoSlugsByCategory('KEGIATAN_KOMPETISI');
      expect(kegiatanSlugs).toHaveLength(12);
      const promosiSlugs = getDemoSlugsByCategory('PROMOSI');
      expect(promosiSlugs).toHaveLength(12);
    });
  });

  describe('generateStaticParams for all category pages', () => {
    it('returns 12 static params for beasiswa', async () => {
      const params = await beasiswaStaticParams();
      expect(params).toHaveLength(12);
      expect(params[0]).toHaveProperty('slug');
    });

    it('returns 12 static params for event', async () => {
      const params = await eventStaticParams();
      expect(params).toHaveLength(12);
      expect(params[0]).toHaveProperty('slug');
    });

    it('returns 12 static params for kegiatan-kompetisi', async () => {
      const params = await kegiatanStaticParams();
      expect(params).toHaveLength(12);
      expect(params[0]).toHaveProperty('slug');
    });

    it('returns 12 static params for promosi', async () => {
      const params = await promosiStaticParams();
      expect(params).toHaveLength(12);
      expect(params[0]).toHaveProperty('slug');
    });
  });
});
