const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (basePath && !/^\/[a-zA-Z0-9._-]+$/.test(basePath)) {
  throw new Error('NEXT_PUBLIC_BASE_PATH harus kosong atau /nama-repository.');
}
const demoDate = process.env.NEXT_PUBLIC_DEMO_DATE || '2026-10-02T12:00:00.000Z';
if (!Number.isFinite(Date.parse(demoDate))) throw new Error('Tanggal acuan demo tidak valid.');

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_DEMO_DATE: demoDate },
};
