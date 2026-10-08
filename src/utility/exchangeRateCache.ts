export const EXCHANGE_RATE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function isExchangeRateCacheStale(
  lastUpdated: string | undefined,
  now = Date.now(),
): boolean {
  if (!lastUpdated) return true;

  const lastUpdatedAt = new Date(lastUpdated).getTime();
  return !Number.isFinite(lastUpdatedAt) || now - lastUpdatedAt >= EXCHANGE_RATE_CACHE_TTL_MS;
}
