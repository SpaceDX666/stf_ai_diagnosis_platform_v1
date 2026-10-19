import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimitsForTests } from "@/server/rate-limit";
beforeEach(resetRateLimitsForTests);
describe("anonymous rate limit", () => { it("allows 120 GETs per minute and rejects the next one", () => { const request = new Request("http://portal/api/portal/vehicles", { headers: { "x-forwarded-for": "203.0.113.8" } }); for (let index = 0; index < 120; index++) expect(rateLimit(request)).toBeNull(); expect(rateLimit(request)?.status).toBe(429); }); });
