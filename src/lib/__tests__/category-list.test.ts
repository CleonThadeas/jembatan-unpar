import { describe, it, expect, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { loadCategoryList, parseListSearchParams } from '@/lib/category-list';
import type { ContentListResponse, Tag } from '@/types/content';

const tags: Tag[] = [{ id: 't1', name: 'Riset', slug: 'riset' }];

describe('parseListSearchParams', () => {
  it('defaults every field when params are missing', () => {
    expect(parseListSearchParams(undefined)).toEqual({
      q: '',
      tag: '',
      sort: 'published_at_desc',
      availability: undefined,
      page: 1,
    });
  });

  it('keeps supported values', () => {
    expect(
      parseListSearchParams({
        q: 'kip',
        tag: 'riset',
        sort: 'views_desc',
        availability: 'aktif',
        page: '3',
      })
    ).toEqual({
      q: 'kip',
      tag: 'riset',
      sort: 'views_desc',
      availability: 'aktif',
      page: 3,
    });
  });

  it('parses valid availability values', () => {
    expect(parseListSearchParams({ availability: 'aktif' }).availability).toBe('aktif');
    expect(parseListSearchParams({ availability: 'berakhir' }).availability).toBe('berakhir');
  });

  it.each(['all', 'unknown', 'DROP TABLE', ''])('drops unsupported availability for %s', (availability) => {
    expect(parseListSearchParams({ availability }).availability).toBeUndefined();
  });

  it.each(['status', 'DROP TABLE', 'published_at_desc;', ''])('falls back to the default sort for %s', (sort) => {
    expect(parseListSearchParams({ sort }).sort).toBe('published_at_desc');
  });

  it.each(['0', '-2', 'abc', '1e9x'])('falls back to page 1 for %s', (page) => {
    expect(parseListSearchParams({ page }).page).toBe(1);
  });
});

describe('loadCategoryList', () => {
  const params = {
    q: '',
    tag: '',
    sort: 'published_at_desc' as const,
    availability: 'aktif' as const,
    page: 2,
  };

  it('returns backend data, pagination and tags on success with PER_PAGE 10 and availability', async () => {
    const response: ContentListResponse = {
      data: [],
      pagination: { page: 2, total_items: 12, total_pages: 2, has_next: false, has_prev: true },
    };
    const fetchList = vi.fn().mockResolvedValue(response);

    const result = await loadCategoryList(fetchList, async () => tags, params, 'Gagal memuat.');

    expect(fetchList).toHaveBeenCalledWith({
      q: '',
      tag: '',
      sort: 'published_at_desc',
      availability: 'aktif',
      page: 2,
      per_page: 10,
    });
    expect(result).toEqual({ contents: [], pagination: response.pagination, tags, error: null });
  });

  it('guards against a malformed body instead of crashing', async () => {
    const fetchList = vi.fn().mockResolvedValue({ data: null });

    const result = await loadCategoryList(fetchList, async () => tags, params, 'Gagal memuat.');

    expect(result.contents).toEqual([]);
    expect(result.pagination).toMatchObject({ page: 2, total_items: 0, total_pages: 0 });
    expect(result.error).toBeNull();
  });

  it('surfaces the (already generic) ApiError message', async () => {
    const fetchList = vi.fn().mockRejectedValue(new ApiError('Layanan informasi sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi.', 503));

    const result = await loadCategoryList(fetchList, async () => tags, params, 'Gagal memuat.');

    expect(result.error).toBe('Layanan informasi sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi.');
    expect(result.contents).toEqual([]);
  });

  it('never leaks a raw non-API error message', async () => {
    const fetchList = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:8080'));

    const result = await loadCategoryList(fetchList, async () => tags, params, 'Gagal memuat daftar beasiswa.');

    expect(result.error).toBe('Gagal memuat daftar beasiswa.');
  });

  it('merges API tags with content tags, dedupes by slug with API entries winning', async () => {
    const apiTags: Tag[] = [
      { id: 'api-1', name: 'Riset Kampus', slug: 'riset' },
    ];
    const contents = [
      {
        id: 'c1',
        title: 'Beasiswa Unggulan',
        slug: 'beasiswa-unggulan',
        tags: [
          { id: 'content-1', name: 'Riset Versi Konten', slug: 'riset' },
          { id: 'content-2', name: 'Inovasi', slug: 'inovasi' },
        ],
      },
      {
        id: 'c2',
        title: 'Beasiswa Prestasi',
        slug: 'beasiswa-prestasi',
        tags: [
          { id: 'content-3', name: 'Prestasi', slug: 'prestasi' },
        ],
      },
    ];

    const fetchList = vi.fn().mockResolvedValue({
      data: contents,
      pagination: { page: 1, total_items: 2, total_pages: 1, has_next: false, has_prev: false },
    });

    const result = await loadCategoryList(
      fetchList,
      async () => apiTags,
      { ...params, page: 1 },
      'Gagal memuat.'
    );

    expect(result.error).toBeNull();
    expect(result.contents).toEqual(contents);
    // API tag 'Riset Kampus' wins over content tag 'Riset Versi Konten'
    // Sorted by name with localeCompare('id'): 'Inovasi' -> 'Prestasi' -> 'Riset Kampus'
    expect(result.tags).toEqual([
      { id: 'content-2', name: 'Inovasi', slug: 'inovasi' },
      { id: 'content-3', name: 'Prestasi', slug: 'prestasi' },
      { id: 'api-1', name: 'Riset Kampus', slug: 'riset' },
    ]);
  });

  it('ensures active tag filter from params appears even when missing from API and contents', async () => {
    const fetchList = vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, total_items: 0, total_pages: 0, has_next: false, has_prev: false },
    });

    const result = await loadCategoryList(
      fetchList,
      async () => [],
      { ...params, tag: 'alumni-peduli' },
      'Gagal memuat.'
    );

    expect(result.error).toBeNull();
    expect(result.tags).toEqual([
      { id: 'alumni-peduli', name: 'alumni-peduli', slug: 'alumni-peduli' },
    ]);
  });

  it('does not duplicate active tag when already present in API tags', async () => {
    const apiTags: Tag[] = [{ id: 'api-riset', name: 'Riset', slug: 'riset' }];
    const fetchList = vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, total_items: 0, total_pages: 0, has_next: false, has_prev: false },
    });

    const result = await loadCategoryList(
      fetchList,
      async () => apiTags,
      { ...params, tag: 'riset' },
      'Gagal memuat.'
    );

    expect(result.tags).toHaveLength(1);
    expect(result.tags[0]).toEqual({ id: 'api-riset', name: 'Riset', slug: 'riset' });
  });

  it('sorts merged tags by name using localeCompare id', async () => {
    const apiTags: Tag[] = [
      { id: '1', name: 'Zakat', slug: 'zakat' },
      { id: '2', name: 'Akademik', slug: 'akademik' },
      { id: '3', name: 'Bantuan', slug: 'bantuan' },
    ];
    const fetchList = vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, total_items: 0, total_pages: 0, has_next: false, has_prev: false },
    });

    const result = await loadCategoryList(
      fetchList,
      async () => apiTags,
      params,
      'Gagal memuat.'
    );

    expect(result.tags.map((t) => t.name)).toEqual(['Akademik', 'Bantuan', 'Zakat']);
  });

  it('gracefully degrades tags when fetchTags rejects but fetchList succeeds', async () => {
    const contents = [
      {
        id: 'c1',
        title: 'Kompetisi Sains',
        slug: 'kompetisi-sains',
        tags: [{ id: 'tag-1', name: 'Sains', slug: 'sains' }],
      },
    ];
    const fetchList = vi.fn().mockResolvedValue({
      data: contents,
      pagination: { page: 1, total_items: 1, total_pages: 1, has_next: false, has_prev: false },
    });
    const fetchTagsFailing = vi.fn().mockRejectedValue(new Error('Tag service network failure'));

    const result = await loadCategoryList(
      fetchList,
      fetchTagsFailing,
      params,
      'Gagal memuat.'
    );

    expect(result.error).toBeNull();
    expect(result.contents).toEqual(contents);
    expect(result.tags).toEqual([{ id: 'tag-1', name: 'Sains', slug: 'sains' }]);
  });
});
