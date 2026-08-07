import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ RATE_LIMIT_WINDOW_MS: 60_000, RATE_LIMIT_MAX_REQUESTS: 3 }),
}));

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("permite peticiones dentro del límite", () => {
    const key = `test-${Math.random()}`;
    const r1 = checkRateLimit(key, { maxRequests: 3, windowMs: 60_000 });
    const r2 = checkRateLimit(key, { maxRequests: 3, windowMs: 60_000 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("bloquea al superar el máximo de peticiones", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, { maxRequests: 2, windowMs: 60_000 });
    checkRateLimit(key, { maxRequests: 2, windowMs: 60_000 });
    const third = checkRateLimit(key, { maxRequests: 2, windowMs: 60_000 });
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resetea la ventana después de que expira", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, { maxRequests: 1, windowMs: 10 });
    const blocked = checkRateLimit(key, { maxRequests: 1, windowMs: 10 });
    expect(blocked.allowed).toBe(false);
  });

  it("mantiene contadores independientes por key", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    checkRateLimit(keyA, { maxRequests: 1, windowMs: 60_000 });
    const resultB = checkRateLimit(keyB, { maxRequests: 1, windowMs: 60_000 });
    expect(resultB.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("usa x-forwarded-for cuando está presente, tomando la primera IP", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.1, 70.41.3.18" });
    expect(getClientIp(headers)).toBe("203.0.113.1");
  });

  it("cae a x-real-ip cuando no hay x-forwarded-for", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.7" });
    expect(getClientIp(headers)).toBe("198.51.100.7");
  });

  it("devuelve 'unknown' cuando no hay ningún header", () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });
});
