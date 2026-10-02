import { assetPath } from './demo/asset-path';

const LINK_PROTOCOLS = ['http:', 'https:', 'mailto:'];
const HTTP_PROTOCOLS = ['http:', 'https:'];

// Browsers strip tabs/newlines and treat "\" as "/", so "/\evil" or "/\t/evil"
// would become protocol-relative. Reject them outright.
const UNSAFE_URL_CHARS = /[\\\u0000-\u001F\u007F\s]/;

// CMS values come from the backend but are admin-authored; only render
// known-safe schemes or same-origin paths (not protocol-relative "//").
function allowUrl(url: string | null | undefined, protocols: string[]): string | undefined {
  if (!url || UNSAFE_URL_CHARS.test(url)) return undefined;
  if (url.startsWith('/')) {
    return url.startsWith('//') ? undefined : url;
  }
  try {
    return protocols.includes(new URL(url).protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

// Email OTP codes (report verification and access-code recovery) are 6 digits.
export const OTP_LENGTH = 6;
const OTP_PATTERN = /^[0-9]{6}$/;

// Keep only digits and cap to OTP_LENGTH, so paste of "123 456" or "Kode: 123456" still works.
export function sanitizeOtp(value: string): string {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function isValidOtp(value: string): boolean {
  return OTP_PATTERN.test(value);
}

export function safeLinkUrl(url?: string | null): string | undefined {
  return allowUrl(url, LINK_PROTOCOLS);
}

export function safeImageUrl(url?: string | null): string | undefined {
  const allowed = allowUrl(url, HTTP_PROTOCOLS);
  if (!allowed) return undefined;
  return allowed.startsWith('/') ? assetPath(allowed) : allowed;
}

// Static HTML is rendered at build time (UTC on CI) and hydrated in the visitor's browser;
// a fixed zone keeps both renders identical and avoids hydration mismatches.
const DISPLAY_TIME_ZONE = 'Asia/Jakarta';

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: DISPLAY_TIME_ZONE,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: DISPLAY_TIME_ZONE,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTimeRange(startStr?: string | null, endStr?: string | null): string {
  if (!startStr && !endStr) return '-';
  if (startStr && !endStr) return formatDateTime(startStr);
  if (!startStr && endStr) return `Sampai ${formatDateTime(endStr)}`;

  const start = formatDate(startStr);
  const end = formatDate(endStr);
  if (start === end) {
    return `${start} (${formatTimeOnly(startStr)} - ${formatTimeOnly(endStr)})`;
  }
  return `${formatDateTime(startStr)} - ${formatDateTime(endStr)}`;
}

export function formatTimeOnly(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: DISPLAY_TIME_ZONE,
    }).format(date);
  } catch {
    return '';
  }
}
