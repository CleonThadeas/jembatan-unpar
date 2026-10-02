import { describe, it, expect, vi } from 'vitest';
import {
  safeImageUrl,
  safeLinkUrl,
  formatDate,
  formatDateTime,
  formatDateTimeRange,
  formatTimeOnly,
} from '@/lib/utils';

describe('safeLinkUrl', () => {
  it.each(['https://example.ac.id/daftar', 'http://localhost:3000/x', 'mailto:beasiswa@kampus.ac.id', '/beasiswa'])(
    'accepts %s',
    (url) => {
      expect(safeLinkUrl(url)).toBe(url);
    }
  );

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//evil.example',
    '/\\evil.example',
    '/\t/evil.example',
    '/\n/evil.example',
    '\\\\evil.example',
    ' javascript:alert(1)',
    'vbscript:x',
    '',
  ])(
    'rejects %s',
    (url) => {
      expect(safeLinkUrl(url)).toBeUndefined();
    }
  );

  it('returns undefined for missing values', () => {
    expect(safeLinkUrl(undefined)).toBeUndefined();
    expect(safeLinkUrl(null)).toBeUndefined();
  });
});

describe('safeImageUrl', () => {
  it.each(['https://cdn.kampus.ac.id/hero.jpg', 'http://127.0.0.1:8080/img.png', '/images/hero.png'])(
    'accepts %s',
    (url) => {
      expect(safeImageUrl(url)).toBe(url);
    }
  );

  it.each([
    'javascript:alert(1)',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'mailto:a@b.c',
    '//evil.example/x.png',
    '/\\evil.example/x.png',
  ])(
    'rejects %s',
    (url) => {
      expect(safeImageUrl(url)).toBeUndefined();
    }
  );

  it('prefixes relative image paths when NEXT_PUBLIC_BASE_PATH is configured', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/portal-guest-prototype');
    const { safeImageUrl: testSafeImageUrl } = await import('@/lib/utils');
    expect(testSafeImageUrl('/images/demo/library.jpg')).toBe(
      '/portal-guest-prototype/images/demo/library.jpg'
    );
    expect(testSafeImageUrl('https://cdn.kampus.ac.id/hero.jpg')).toBe(
      'https://cdn.kampus.ac.id/hero.jpg'
    );
    vi.unstubAllEnvs();
  });
});

describe('Date formatting helpers', () => {
  it('formats dates in id-ID format', () => {
    const formatted = formatDate('2026-09-27T10:00:00Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('September');
  });

  it('handles empty/invalid date inputs gracefully', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('invalid-date')).toBe('-');
  });

  it('formats date time range', () => {
    const range = formatDateTimeRange('2026-09-27T10:00:00Z', '2026-09-27T12:00:00Z');
    expect(range).toBeDefined();
    expect(formatDateTimeRange(null, null)).toBe('-');
  });

  it('formats time only', () => {
    expect(formatTimeOnly(null)).toBe('');
    expect(formatTimeOnly('2026-09-27T10:00:00Z')).toBeDefined();
  });
});
