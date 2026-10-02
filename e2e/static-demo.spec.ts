import { test as base, expect } from '@playwright/test';

// Prefix routes with the deployment subpath (e.g. /jembatan-unpar) when testing a GitHub Pages build.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = (url, options) => goto(url.startsWith('/') ? `${BASE_PATH}${url}` : url, options);
    await use(page);
  },
});

const routes = ['/', '/beasiswa/', '/event/', '/kegiatan-kompetisi/', '/promosi/', '/lapor/', '/lapor/cek-laporan/', '/lapor/pemulihan/', '/lapor/tentang/', '/demo/', '/demo/kredit/'];

test('static pages, local photos and responsive navigation work without backend', async ({ page }) => {
  const failed: string[] = [];
  const apiCalls: string[] = [];
  page.on('response', (response) => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => { if (/\/api\/|:8080/.test(request.url())) apiCalls.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Pemberitahuan prototype' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/lapor/', '/demo/']) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow, `${route} at ${width}px`).toBe(false);
    }
  }
  await page.goto('/demo/kredit/');
  const photoLocator = page.locator('img[src*="/images/demo/"]');
  await expect(photoLocator).toHaveCount(4);
  // Credit photos may be lazy-loaded; scroll each into view so the browser actually fetches it.
  for (const photo of await photoLocator.all()) await photo.scrollIntoViewIfNeeded();
  await expect.poll(() => photoLocator.evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(apiCalls).toEqual([]);
  expect(failed).toEqual([]);
});

test('synthetic report access, reply, recovery inbox and reset confirmation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo/');
  const code = (await page.locator('code').first().innerText()).trim();
  await page.goto('/lapor/cek-laporan/');
  await page.getByLabel(/Kode Akses Rahasia/).fill(code);
  await page.getByRole('button', { name: /Buka Laporan/ }).click();
  await expect(page).toHaveURL(/lapor\/detail/);
  await expect(page.getByText(/Nomor Referensi/i).first()).toBeVisible();
  await page.goto('/demo/');
  await page.getByRole('button', { name: /^Reset data demo$/ }).click();
  await expect(page.getByRole('button', { name: /Ya, reset database demo/ })).toBeVisible();
  await page.getByRole('button', { name: 'Batal', exact: true }).click();
  await expect(page.locator('code').first()).toHaveText(code);
});
