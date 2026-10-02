export type ContentType = 'BEASISWA' | 'EVENT' | 'KEGIATAN_KOMPETISI' | 'PROMOSI';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: ContentStatus;
  hero_image_id?: string;
  hero_image_url?: string;
  hero_image_alt?: string;
  organizer: string;
  published_at?: string;
  event_start_at?: string;
  event_end_at?: string;
  registration_deadline?: string;
  registration_url?: string;
  location_or_url?: string;
  requirements?: string;
  promo_period_start?: string;
  promo_period_end?: string;
  terms_and_conditions?: string;
  custom_metadata?: Record<string, unknown>;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface PaginationMeta {
  page: number;
  limit?: number;
  per_page?: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ContentListResponse {
  data: Content[];
  pagination: PaginationMeta;
}

export interface ContentDetailResponse {
  data: Content;
}

export interface TagListResponse {
  data: Tag[];
}

// Sort values accepted by the backend CMS list endpoints (published_at_desc is its default).
export const CONTENT_SORTS = ['published_at_desc', 'published_at_asc', 'views_desc', 'created_at_desc'] as const;

export type ContentSort = (typeof CONTENT_SORTS)[number];

export const CONTENT_AVAILABILITIES = ['aktif', 'berakhir'] as const;

export type ContentAvailability = (typeof CONTENT_AVAILABILITIES)[number];

export interface ContentFilterParams {
  q?: string;
  tag?: string;
  // Untrusted input (e.g. from the URL); unsupported values are dropped by the API client.
  sort?: string;
  availability?: string;
  page?: number;
  per_page?: number;
}

export interface CategoryInfo {
  type: ContentType;
  slug: string;
  label: string;
  description: string;
  apiPath: string;
  singular: string;
  badgeColor: string;
}

export const CATEGORIES: Record<ContentType, CategoryInfo> = {
  BEASISWA: {
    type: 'BEASISWA',
    slug: 'beasiswa',
    label: 'Beasiswa',
    singular: 'Beasiswa',
    description: 'Informasi bantuan dana pendidikan, beasiswa universitas, pemerintah, dan mitra industri.',
    apiPath: '/cms/scholarships',
    badgeColor: 'bg-brand-50 text-brand-900 border-brand-200',
  },
  EVENT: {
    type: 'EVENT',
    slug: 'event',
    label: 'Event Kampus',
    singular: 'Event',
    description: 'Jadwal seminar, workshop, webinar, dan acara kampus lainnya.',
    apiPath: '/cms/events',
    badgeColor: 'bg-brand-50 text-brand-900 border-brand-200',
  },
  KEGIATAN_KOMPETISI: {
    type: 'KEGIATAN_KOMPETISI',
    slug: 'kegiatan-kompetisi',
    label: 'Kegiatan & Kompetisi',
    singular: 'Kegiatan',
    description: 'Lomba akademik, kompetisi inovasi, hackathon, dan kegiatan kemahasiswaan.',
    apiPath: '/cms/activities',
    badgeColor: 'bg-brand-50 text-brand-900 border-brand-200',
  },
  PROMOSI: {
    type: 'PROMOSI',
    slug: 'promosi',
    label: 'Promosi',
    singular: 'Promosi',
    description: 'Penawaran khusus, diskon mahasiswa, pelatihan bersertifikat, dan program kemitraan.',
    apiPath: '/cms/promotions',
    badgeColor: 'bg-brand-50 text-brand-900 border-brand-200',
  },
};
