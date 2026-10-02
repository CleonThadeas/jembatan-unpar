import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { newIdempotencyKey } from '@/lib/idempotency';

describe('newIdempotencyKey', () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('generates a valid RFC 4122 v4 UUID using crypto.randomUUID', () => {
    const key = newIdempotencyKey();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(key).toMatch(uuidV4Regex);
  });

  it('generates distinct keys on consecutive calls', () => {
    const key1 = newIdempotencyKey();
    const key2 = newIdempotencyKey();
    expect(key1).not.toBe(key2);
  });

  it('falls back to crypto.getRandomValues when crypto.randomUUID is not a function', () => {
    const mockGetRandomValues = vi.fn((buffer: Uint8Array) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = (i * 17) % 256;
      }
      return buffer;
    });

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: mockGetRandomValues,
        randomUUID: undefined,
      },
      configurable: true,
      writable: true,
    });

    const key = newIdempotencyKey();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(key).toMatch(uuidV4Regex);
    expect(mockGetRandomValues).toHaveBeenCalled();
  });

  it('throws an error if Web Crypto is completely unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => newIdempotencyKey()).toThrow(/Web Crypto tidak tersedia/i);
  });
});
