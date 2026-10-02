import type { Content } from '@/types/content';

type ContentDeadlineFields = Pick<
  Content,
  'type' | 'registration_deadline' | 'event_start_at' | 'event_end_at' | 'promo_period_end'
>;

/**
 * Returns the relevant deadline string for a content item based on its type.
 * - BEASISWA & KEGIATAN_KOMPETISI: registration_deadline
 * - EVENT: event_end_at ?? event_start_at
 * - PROMOSI: promo_period_end
 */
export function getContentDeadline(content: ContentDeadlineFields): string | undefined {
  switch (content.type) {
    case 'BEASISWA':
    case 'KEGIATAN_KOMPETISI':
      return content.registration_deadline || undefined;
    case 'EVENT':
      return content.event_end_at || content.event_start_at || undefined;
    case 'PROMOSI':
      return content.promo_period_end || undefined;
    default:
      return undefined;
  }
}

/**
 * Returns default reference date for prototype demo consistency.
 */
export function getDemoReferenceDate(): Date {
  return new Date(process.env.NEXT_PUBLIC_DEMO_DATE || '2026-10-02T12:00:00.000Z');
}

/**
 * Determines whether a content item is expired relative to `now`.
 * An item is expired iff its deadline parses to a valid date and that date < now.
 * Missing or unparseable deadlines return false (not expired).
 */
export function isContentExpired(
  content: ContentDeadlineFields,
  now: Date = new Date(process.env.NEXT_PUBLIC_DEMO_DATE || '2026-10-02T12:00:00.000Z')
): boolean {
  const deadline = getContentDeadline(content);
  if (!deadline) {
    return false;
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return false;
  }

  return deadlineDate.getTime() < now.getTime();
}
