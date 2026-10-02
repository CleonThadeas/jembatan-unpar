import {
  CONTENT_AVAILABILITIES,
  CONTENT_SORTS,
  Content,
  ContentAvailability,
  ContentFilterParams,
  ContentListResponse,
  ContentSort,
  Tag,
} from '@/types/content';
import {
  ApiError,
  getDemoContentBySlug,
  getDemoTags,
  queryDemoContent,
} from './demo/content-service';

export { ApiError };

export function isNotFoundError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

export function isContentSort(value: unknown): value is ContentSort {
  return typeof value === 'string' && (CONTENT_SORTS as readonly string[]).includes(value);
}

export function isContentAvailability(value: unknown): value is ContentAvailability {
  return typeof value === 'string' && (CONTENT_AVAILABILITIES as readonly string[]).includes(value);
}

/**
 * Retained for backward compatibility.
 * In prototype mode, all content requests are resolved via in-memory demo fixtures.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    const internalUrl =
      process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_API_URL || 'http://127.0.0.1:8080';
    return `${internalUrl.replace(/\/$/, '')}/api/v1`;
  }
  const override = process.env.NEXT_PUBLIC_API_URL;
  if (override && override.startsWith('/') && !override.startsWith('//') && !override.startsWith('/\\')) {
    return override.replace(/\/$/, '');
  }
  return '/api/v1';
}

/**
 * Fetch scholarships list from demo fixture service
 */
export async function fetchScholarships(params?: ContentFilterParams): Promise<ContentListResponse> {
  return queryDemoContent('BEASISWA', params);
}

/**
 * Fetch scholarship detail by slug from demo fixture service
 */
export async function fetchScholarshipBySlug(slug: string): Promise<Content> {
  return getDemoContentBySlug('BEASISWA', slug);
}

/**
 * Fetch events list from demo fixture service
 */
export async function fetchEvents(params?: ContentFilterParams): Promise<ContentListResponse> {
  return queryDemoContent('EVENT', params);
}

/**
 * Fetch event detail by slug from demo fixture service
 */
export async function fetchEventBySlug(slug: string): Promise<Content> {
  return getDemoContentBySlug('EVENT', slug);
}

/**
 * Fetch activities/competitions list from demo fixture service
 */
export async function fetchActivities(params?: ContentFilterParams): Promise<ContentListResponse> {
  return queryDemoContent('KEGIATAN_KOMPETISI', params);
}

/**
 * Fetch activity detail by slug from demo fixture service
 */
export async function fetchActivityBySlug(slug: string): Promise<Content> {
  return getDemoContentBySlug('KEGIATAN_KOMPETISI', slug);
}

/**
 * Fetch promotions list from demo fixture service
 */
export async function fetchPromotions(params?: ContentFilterParams): Promise<ContentListResponse> {
  return queryDemoContent('PROMOSI', params);
}

/**
 * Fetch promotion detail by slug from demo fixture service
 */
export async function fetchPromotionBySlug(slug: string): Promise<Content> {
  return getDemoContentBySlug('PROMOSI', slug);
}

/**
 * Fetch tags list from demo fixture service
 */
export async function fetchTags(): Promise<Tag[]> {
  return getDemoTags();
}
