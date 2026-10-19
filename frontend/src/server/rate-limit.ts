import { NextResponse } from "next/server";

type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();
const CAPACITY = 120;
const REFILL_PER_MS = CAPACITY / 60_000;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(request: Request): NextResponse | null {
  const now = Date.now();
  const key = clientIp(request);
  const current = buckets.get(key) ?? { tokens: CAPACITY, updatedAt: now };
  current.tokens = Math.min(CAPACITY, current.tokens + (now - current.updatedAt) * REFILL_PER_MS);
  current.updatedAt = now;
  if (current.tokens < 1) {
    buckets.set(key, current);
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests" } },
      { status: 429, headers: { "Retry-After": "1", "Cache-Control": "no-store" } },
    );
  }
  current.tokens -= 1;
  buckets.set(key, current);
  if (buckets.size > 10_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (now - bucket.updatedAt > 120_000) buckets.delete(bucketKey);
    }
  }
  return null;
}

export function resetRateLimitsForTests(): void {
  buckets.clear();
}
