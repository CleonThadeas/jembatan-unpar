export const DEMO_REFERENCE_DATE_ISO = '2026-10-02T12:00:00.000Z';

/**
 * Returns the fixed demo reference date.
 * Relies on NEXT_PUBLIC_DEMO_DATE env var or falls back to 2026-10-02T12:00:00.000Z.
 */
export function getDemoReferenceDate(): Date {
  const envDate = process.env.NEXT_PUBLIC_DEMO_DATE;
  if (envDate) {
    const parsed = Date.parse(envDate);
    if (Number.isFinite(parsed)) {
      return new Date(parsed);
    }
  }
  return new Date(DEMO_REFERENCE_DATE_ISO);
}
