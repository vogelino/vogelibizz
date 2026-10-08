import { describe, expect, test } from "bun:test";

import { EXCHANGE_RATE_CACHE_TTL_MS, isExchangeRateCacheStale } from "./exchangeRateCache";

describe("exchange-rate cache", () => {
  const now = Date.parse("2026-07-25T12:00:00.000Z");

  test("keeps rates fresh for 24 hours", () => {
    expect(
      isExchangeRateCacheStale(new Date(now - EXCHANGE_RATE_CACHE_TTL_MS + 1).toISOString(), now),
    ).toBe(false);
  });

  test("expires rates once they are 24 hours old", () => {
    expect(
      isExchangeRateCacheStale(new Date(now - EXCHANGE_RATE_CACHE_TTL_MS).toISOString(), now),
    ).toBe(true);
  });

  test("expires missing or invalid timestamps", () => {
    expect(isExchangeRateCacheStale(undefined, now)).toBe(true);
    expect(isExchangeRateCacheStale("not-a-date", now)).toBe(true);
  });
});
