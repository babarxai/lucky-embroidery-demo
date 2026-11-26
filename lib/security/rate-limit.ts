import "server-only";

import crypto from "node:crypto";
import { getTrustedServerClient } from "../supabase/server.ts";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Creates a salted SHA-256 hash of the client IP to protect user privacy
 * while allowing durable rate limiting.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_SALT || "lucky-embroidery-ip-salt-2026";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

/**
 * Durable serverless rate limiter.
 * 1. Checks Upstash Redis if configured (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
 * 2. Defaults to durable Supabase database checks on `public.enquiries.ip_hash`
 *    (e.g., max 5 submissions per 60 minutes per IP).
 */
export async function checkRateLimit(
  clientIp: string,
  options: { maxRequests?: number; windowMinutes?: number } = {}
): Promise<RateLimitResult> {
  const maxRequests = options.maxRequests ?? 5;
  const windowMinutes = options.windowMinutes ?? 60;
  const resetSeconds = windowMinutes * 60;

  const hashed = hashIp(clientIp || "127.0.0.1");

  // Option A: Upstash Redis REST API (if configured)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const key = `rate_limit:enquiries:${hashed}`;
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, resetSeconds],
        ]),
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = results[0]?.result || 1;
        const remaining = Math.max(0, maxRequests - currentCount);

        return {
          success: currentCount <= maxRequests,
          limit: maxRequests,
          remaining,
          resetSeconds,
        };
      }
    } catch {
      // Fallback to database check
    }
  }

  // Option B: Durable Supabase Database Check
  try {
    const supabase = getTrustedServerClient();
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", hashed)
      .gte("created_at", windowStart);

    if (error) {
      // If table query fails, fail open gracefully with remaining = 1
      return { success: true, limit: maxRequests, remaining: 1, resetSeconds };
    }

    const currentCount = count || 0;
    const remaining = Math.max(0, maxRequests - currentCount);

    return {
      success: currentCount < maxRequests,
      limit: maxRequests,
      remaining,
      resetSeconds,
    };
  } catch {
    return { success: true, limit: maxRequests, remaining: 1, resetSeconds };
  }
}
