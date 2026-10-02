import type { NextRequest } from 'next/server';

/**
 * When this app is served over HTTPS (directly or behind a TLS-terminating
 * proxy), relayed session cookies must carry the Secure attribute even if the
 * backend, reached over plain HTTP internally, omitted it.
 */
export function isHttpsRequest(request: NextRequest): boolean {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim().toLowerCase();
  return request.nextUrl.protocol === 'https:' || forwardedProto === 'https';
}

/**
 * Ensures the Set-Cookie string contains the Secure flag.
 */
export function withSecureFlag(cookie: string): string {
  return /;\s*secure\s*(;|$)/i.test(cookie) ? cookie : `${cookie}; Secure`;
}

/**
 * Extracts the exact value of a cookie by name from a Cookie header string.
 * Uses exact-name matching to prevent prefix collision (e.g. fake_session vs session).
 */
export function extractCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (key === name) {
      return trimmed.slice(eqIdx + 1).trim();
    }
  }
  return null;
}

/**
 * Filters an inbound Cookie header string to strictly include only the allowed cookie.
 * Returns null if the allowed cookie is not present.
 */
export function filterInboundCookie(cookieHeader: string | null, allowedName: string): string | null {
  const val = extractCookie(cookieHeader, allowedName);
  if (val === null) return null;
  return `${allowedName}=${val}`;
}

/**
 * Splits a possibly comma-combined Set-Cookie string into individual cookie definitions.
 * Handles the comma inside `Expires=Day, DD-Mon-YYYY ...` without false splitting.
 */
export function splitCombinedSetCookie(header: string): string[] {
  const results: string[] = [];
  // Match comma followed by whitespace and a valid cookie name starting a new cookie definition
  // Cookie names cannot contain separators/spaces
  const parts = header.split(/,\s*(?=[!#$%&'*+\-.^_`|~0-9A-Za-z]+=)/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      results.push(trimmed);
    }
  }
  return results;
}

/**
 * Filters Set-Cookie entries (array or single combined header string) to only include
 * cookies for allowedName. Appends Secure attribute when isHttps is true.
 */
export function filterSetCookies(
  setCookies: string[] | string | null | undefined,
  allowedName: string,
  isHttps = false
): string[] {
  if (!setCookies) return [];
  const rawList: string[] = Array.isArray(setCookies)
    ? setCookies.flatMap((c) => splitCombinedSetCookie(c))
    : splitCombinedSetCookie(setCookies);

  const prefix = `${allowedName}=`;
  const filtered: string[] = [];

  for (const cookieStr of rawList) {
    const trimmed = cookieStr.trim();
    if (trimmed.startsWith(prefix)) {
      filtered.push(isHttps ? withSecureFlag(trimmed) : trimmed);
    }
  }

  return filtered;
}
