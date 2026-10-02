import { describe, it, expect } from 'vitest';
import { getContentDeadline, isContentExpired } from '../expiry';

describe('expiry utilities', () => {
  const referenceTime = new Date('2026-10-02T12:00:00Z');
  const pastDate = '2026-09-01T00:00:00Z';
  const futureDate = '2026-11-01T00:00:00Z';
  const invalidDate = 'invalid-date-string';

  describe('getContentDeadline', () => {
    it('returns registration_deadline for BEASISWA', () => {
      expect(
        getContentDeadline({
          type: 'BEASISWA',
          registration_deadline: '2026-10-15T00:00:00Z',
        })
      ).toBe('2026-10-15T00:00:00Z');
    });

    it('returns undefined for BEASISWA when registration_deadline is missing or empty', () => {
      expect(getContentDeadline({ type: 'BEASISWA' })).toBeUndefined();
      expect(getContentDeadline({ type: 'BEASISWA', registration_deadline: '' })).toBeUndefined();
    });

    it('returns registration_deadline for KEGIATAN_KOMPETISI', () => {
      expect(
        getContentDeadline({
          type: 'KEGIATAN_KOMPETISI',
          registration_deadline: '2026-10-20T00:00:00Z',
        })
      ).toBe('2026-10-20T00:00:00Z');
    });

    it('returns undefined for KEGIATAN_KOMPETISI when registration_deadline is missing', () => {
      expect(getContentDeadline({ type: 'KEGIATAN_KOMPETISI' })).toBeUndefined();
    });

    it('prefers event_end_at over event_start_at for EVENT', () => {
      expect(
        getContentDeadline({
          type: 'EVENT',
          event_start_at: '2026-10-05T09:00:00Z',
          event_end_at: '2026-10-05T17:00:00Z',
        })
      ).toBe('2026-10-05T17:00:00Z');
    });

    it('falls back to event_start_at for EVENT if event_end_at is missing', () => {
      expect(
        getContentDeadline({
          type: 'EVENT',
          event_start_at: '2026-10-05T09:00:00Z',
        })
      ).toBe('2026-10-05T09:00:00Z');
    });

    it('returns undefined for EVENT when both event dates are missing', () => {
      expect(getContentDeadline({ type: 'EVENT' })).toBeUndefined();
    });

    it('returns promo_period_end for PROMOSI', () => {
      expect(
        getContentDeadline({
          type: 'PROMOSI',
          promo_period_end: '2026-12-31T23:59:59Z',
        })
      ).toBe('2026-12-31T23:59:59Z');
    });

    it('returns undefined for PROMOSI when promo_period_end is missing', () => {
      expect(getContentDeadline({ type: 'PROMOSI' })).toBeUndefined();
    });

    it('returns undefined for unrecognized type', () => {
      expect(
        getContentDeadline({
          type: 'UNKNOWN' as any,
          registration_deadline: '2026-10-15T00:00:00Z',
        })
      ).toBeUndefined();
    });
  });

  describe('isContentExpired', () => {
    describe('BEASISWA', () => {
      it('is expired when registration_deadline is in the past', () => {
        expect(
          isContentExpired(
            { type: 'BEASISWA', registration_deadline: pastDate },
            referenceTime
          )
        ).toBe(true);
      });

      it('is not expired when registration_deadline is in the future', () => {
        expect(
          isContentExpired(
            { type: 'BEASISWA', registration_deadline: futureDate },
            referenceTime
          )
        ).toBe(false);
      });

      it('is not expired when registration_deadline is missing', () => {
        expect(isContentExpired({ type: 'BEASISWA' }, referenceTime)).toBe(false);
      });

      it('is not expired when registration_deadline is invalid', () => {
        expect(
          isContentExpired(
            { type: 'BEASISWA', registration_deadline: invalidDate },
            referenceTime
          )
        ).toBe(false);
      });
    });

    describe('EVENT', () => {
      it('is expired when event_end_at is in the past', () => {
        expect(
          isContentExpired(
            {
              type: 'EVENT',
              event_start_at: pastDate,
              event_end_at: pastDate,
            },
            referenceTime
          )
        ).toBe(true);
      });

      it('is not expired when event_end_at is in the future even if event_start_at is in the past', () => {
        expect(
          isContentExpired(
            {
              type: 'EVENT',
              event_start_at: pastDate,
              event_end_at: futureDate,
            },
            referenceTime
          )
        ).toBe(false);
      });

      it('is expired when only event_start_at is provided and in the past', () => {
        expect(
          isContentExpired(
            { type: 'EVENT', event_start_at: pastDate },
            referenceTime
          )
        ).toBe(true);
      });

      it('is not expired when only event_start_at is provided and in the future', () => {
        expect(
          isContentExpired(
            { type: 'EVENT', event_start_at: futureDate },
            referenceTime
          )
        ).toBe(false);
      });

      it('is not expired when both event dates are missing', () => {
        expect(isContentExpired({ type: 'EVENT' }, referenceTime)).toBe(false);
      });

      it('is not expired when event dates are invalid', () => {
        expect(
          isContentExpired(
            {
              type: 'EVENT',
              event_start_at: invalidDate,
              event_end_at: invalidDate,
            },
            referenceTime
          )
        ).toBe(false);
      });
    });

    describe('KEGIATAN_KOMPETISI', () => {
      it('is expired when registration_deadline is in the past', () => {
        expect(
          isContentExpired(
            { type: 'KEGIATAN_KOMPETISI', registration_deadline: pastDate },
            referenceTime
          )
        ).toBe(true);
      });

      it('is not expired when registration_deadline is in the future', () => {
        expect(
          isContentExpired(
            { type: 'KEGIATAN_KOMPETISI', registration_deadline: futureDate },
            referenceTime
          )
        ).toBe(false);
      });

      it('is not expired when registration_deadline is missing', () => {
        expect(isContentExpired({ type: 'KEGIATAN_KOMPETISI' }, referenceTime)).toBe(false);
      });

      it('is not expired when registration_deadline is invalid', () => {
        expect(
          isContentExpired(
            { type: 'KEGIATAN_KOMPETISI', registration_deadline: invalidDate },
            referenceTime
          )
        ).toBe(false);
      });
    });

    describe('PROMOSI', () => {
      it('is expired when promo_period_end is in the past', () => {
        expect(
          isContentExpired(
            { type: 'PROMOSI', promo_period_end: pastDate },
            referenceTime
          )
        ).toBe(true);
      });

      it('is not expired when promo_period_end is in the future', () => {
        expect(
          isContentExpired(
            { type: 'PROMOSI', promo_period_end: futureDate },
            referenceTime
          )
        ).toBe(false);
      });

      it('is not expired when promo_period_end is missing', () => {
        expect(isContentExpired({ type: 'PROMOSI' }, referenceTime)).toBe(false);
      });

      it('is not expired when promo_period_end is invalid', () => {
        expect(
          isContentExpired(
            { type: 'PROMOSI', promo_period_end: invalidDate },
            referenceTime
          )
        ).toBe(false);
      });
    });

    describe('default now parameter', () => {
      it('defaults now to demo reference date when omitted and env is not set', () => {
        // 1 hour before default demo date 2026-10-02T12:00:00.000Z
        expect(
          isContentExpired({
            type: 'BEASISWA',
            registration_deadline: '2026-10-02T11:00:00.000Z',
          })
        ).toBe(true);

        // 1 hour after default demo date 2026-10-02T12:00:00.000Z
        expect(
          isContentExpired({
            type: 'BEASISWA',
            registration_deadline: '2026-10-02T13:00:00.000Z',
          })
        ).toBe(false);
      });

      it('respects NEXT_PUBLIC_DEMO_DATE when configured', () => {
        const originalEnv = process.env.NEXT_PUBLIC_DEMO_DATE;
        try {
          process.env.NEXT_PUBLIC_DEMO_DATE = '2026-12-01T00:00:00.000Z';
          expect(
            isContentExpired({
              type: 'BEASISWA',
              registration_deadline: '2026-11-15T00:00:00.000Z',
            })
          ).toBe(true);
          expect(
            isContentExpired({
              type: 'BEASISWA',
              registration_deadline: '2026-12-15T00:00:00.000Z',
            })
          ).toBe(false);
        } finally {
          process.env.NEXT_PUBLIC_DEMO_DATE = originalEnv;
        }
      });

      it('retains explicit now argument overriding default clock', () => {
        expect(
          isContentExpired(
            {
              type: 'BEASISWA',
              registration_deadline: '2026-10-02T11:00:00.000Z',
            },
            new Date('2026-10-01T00:00:00.000Z')
          )
        ).toBe(false);
      });
    });
  });
});
