import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
  isHttpsRequest,
  withSecureFlag,
  extractCookie,
  filterInboundCookie,
  filterSetCookies,
} from '@/lib/proxy-cookies';

describe('proxy-cookies helper', () => {
  describe('isHttpsRequest', () => {
    it('returns true when nextUrl protocol is https:', () => {
      const req = new NextRequest('https://aspirasi.univ.ac.id/api/v1/reports/categories');
      expect(isHttpsRequest(req)).toBe(true);
    });

    it('returns true when x-forwarded-proto is https', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/reports/categories', {
        headers: { 'x-forwarded-proto': 'https' },
      });
      expect(isHttpsRequest(req)).toBe(true);
    });

    it('returns true when x-forwarded-proto has comma-separated list starting with https', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/reports/categories', {
        headers: { 'x-forwarded-proto': 'https, http' },
      });
      expect(isHttpsRequest(req)).toBe(true);
    });

    it('returns false when on plain http without forwarded header', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/reports/categories');
      expect(isHttpsRequest(req)).toBe(false);
    });

    it('returns false when x-forwarded-proto is http', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/reports/categories', {
        headers: { 'x-forwarded-proto': 'http' },
      });
      expect(isHttpsRequest(req)).toBe(false);
    });
  });

  describe('withSecureFlag', () => {
    it('appends ; Secure when not present', () => {
      const cookie = 'report_session=token123; Path=/; HttpOnly; SameSite=Lax';
      expect(withSecureFlag(cookie)).toBe('report_session=token123; Path=/; HttpOnly; SameSite=Lax; Secure');
    });

    it('does not duplicate Secure when already present', () => {
      const cookie = 'report_session=token123; Path=/; HttpOnly; Secure; SameSite=Lax';
      expect(withSecureFlag(cookie)).toBe(cookie);
    });

    it('does not duplicate Secure in lowercase', () => {
      const cookie = 'report_session=token123; Path=/; secure; SameSite=Lax';
      expect(withSecureFlag(cookie)).toBe(cookie);
    });
  });

  describe('extractCookie', () => {
    it('extracts named cookie from single cookie header', () => {
      expect(extractCookie('report_session=token123', 'report_session')).toBe('token123');
    });

    it('extracts named cookie from multiple cookies', () => {
      const header = 'theme=dark; report_session=token123; tracking=xyz';
      expect(extractCookie(header, 'report_session')).toBe('token123');
    });

    it('does not match prefix confusion', () => {
      const header = 'fake_report_session=wrong; report_session=correct';
      expect(extractCookie(header, 'report_session')).toBe('correct');
    });

    it('trims whitespace around values', () => {
      const header = 'report_session=  token123  ; other=1';
      expect(extractCookie(header, 'report_session')).toBe('token123');
    });

    it('returns null when cookie is missing', () => {
      expect(extractCookie('admin_session=secret', 'report_session')).toBeNull();
      expect(extractCookie(null, 'report_session')).toBeNull();
      expect(extractCookie('', 'report_session')).toBeNull();
    });
  });

  describe('filterInboundCookie', () => {
    it('returns only allowed cookie when present among others', () => {
      const header = 'admin_session=secret; report_session=token123; session=other';
      expect(filterInboundCookie(header, 'report_session')).toBe('report_session=token123');
    });

    it('returns null when allowed cookie is not present', () => {
      const header = 'admin_session=secret; session=other';
      expect(filterInboundCookie(header, 'report_session')).toBeNull();
    });
  });

  describe('filterSetCookies', () => {
    it('filters Set-Cookie headers to only the allowed cookie name', () => {
      const cookies = [
        'report_session=token123; Path=/; HttpOnly',
        'admin_session=secret; Path=/; HttpOnly',
        'unrelated=value; Path=/',
      ];
      const result = filterSetCookies(cookies, 'report_session');
      expect(result).toEqual(['report_session=token123; Path=/; HttpOnly']);
    });

    it('adds Secure flag if isHttps is true', () => {
      const cookies = [
        'report_session=token123; Path=/; HttpOnly',
        'admin_session=secret; Path=/; HttpOnly',
      ];
      const result = filterSetCookies(cookies, 'report_session', true);
      expect(result).toEqual(['report_session=token123; Path=/; HttpOnly; Secure']);
    });

    it('handles comma-combined Set-Cookie string fallback correctly including Expires dates', () => {
      const combined =
        'report_session=token123; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT; HttpOnly, admin_session=secret; Path=/; HttpOnly';
      const result = filterSetCookies(combined, 'report_session');
      expect(result).toEqual([
        'report_session=token123; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT; HttpOnly',
      ]);
    });
  });
});
