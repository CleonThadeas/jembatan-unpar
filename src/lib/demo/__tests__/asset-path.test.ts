import { describe, expect, it, vi } from 'vitest';

async function load(basePath: string) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_BASE_PATH', basePath);
  return import('../asset-path');
}

describe('prototype asset paths', () => {
  it('supports root deployment', async () => {
    const { assetPath } = await load('');
    expect(assetPath('/images/demo/library.jpg')).toBe('/images/demo/library.jpg');
  });
  it('prefixes project site paths exactly once', async () => {
    const { assetPath } = await load('/portal-guest-prototype');
    expect(assetPath('/images/demo/library.jpg')).toBe('/portal-guest-prototype/images/demo/library.jpg');
    expect(assetPath('/portal-guest-prototype/images/demo/library.jpg')).toBe('/portal-guest-prototype/images/demo/library.jpg');
    expect(assetPath('https://www.pexels.com/license/')).toBe('https://www.pexels.com/license/');
  });
});
