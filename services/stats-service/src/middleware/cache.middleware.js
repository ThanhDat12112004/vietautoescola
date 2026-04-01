const MAX_CACHE_ENTRIES = 500;

const responseCache = new Map();

function pruneExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }
}

function setCacheEntry(key, payload, ttlMs) {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }

  responseCache.set(key, {
    payload,
    expiresAt: Date.now() + ttlMs,
  });
}

function cacheGet(ttlMs, options = {}) {
  const { bypass } = options;
  const ttlSeconds = Math.max(1, Math.floor(ttlMs / 1000));
  const cacheControlHeader = `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}, stale-while-revalidate=${Math.max(ttlSeconds * 2, 30)}`;

  return (req, res, next) => {
    if (req.method !== 'GET' || ttlMs <= 0) return next();
    if (typeof bypass === 'function' && bypass(req)) return next();

    pruneExpiredEntries();

    const key = `${req.originalUrl}`;
    const existing = responseCache.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      res.set('Cache-Control', cacheControlHeader);
      res.set('X-Cache', 'HIT');
      return res.json(existing.payload);
    }

    res.set('Cache-Control', cacheControlHeader);
    res.set('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCacheEntry(key, body, ttlMs);
      }
      return originalJson(body);
    };

    return next();
  };
}

module.exports = { cacheGet };
