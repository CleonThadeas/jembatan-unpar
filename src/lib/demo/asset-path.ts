const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Prefix local public assets, but never remote URLs or already-prefixed paths. */
export function assetPath(value: string): string {
  if (!basePath || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value === basePath || value.startsWith(`${basePath}/`)) return value;
  return `${basePath}${value}`;
}
