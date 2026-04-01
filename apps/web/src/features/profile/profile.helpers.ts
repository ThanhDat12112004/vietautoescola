export function toStoredMediaPath(uploaded: { key?: string; cdn_url?: string } | null | undefined) {
  if (!uploaded) return '';

  const key = String(uploaded.key || '').trim();
  if (key) {
    return `/media/static/${key}`;
  }

  const raw = String(uploaded.cdn_url || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }
}
