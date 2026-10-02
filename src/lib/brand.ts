import { assetPath } from '@/lib/demo/asset-path';

export const BRAND_NAME = 'JEMBATAN';
export const BRAND_TAGLINE = 'Jaringan Aspirasi, Beasiswa, dan Talenta Mahasiswa';
export const BRAND_FULL = `${BRAND_NAME} — ${BRAND_TAGLINE}`;
export const BRAND_STEWARD = 'Dikelola mahasiswa, didukung Universitas Katolik Parahyangan';
export const BRAND_STEWARD_SHORT = 'Dikelola mahasiswa, didukung UNPAR';

export const BRAND_LOGO = {
  src: assetPath('/brand/logo-unpar-white.png'),
  width: 353,
  height: 151,
  alt: 'Universitas Katolik Parahyangan',
} as const;
