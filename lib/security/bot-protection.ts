import "server-only";

export interface BotVerificationResult {
  isBot: boolean;
  reason?: string;
}

/**
 * Checks for honeypot field, submission timing, and optional Cloudflare Turnstile token.
 */
export async function verifyAntiBot(
  input: {
    honeypot?: unknown;
    clientTimestamp?: unknown;
    turnstileToken?: unknown;
  },
  clientIp?: string
): Promise<BotVerificationResult> {
  // 1. Honeypot check: The hidden field must be completely empty
  if (input.honeypot) {
    const honeypotVal = typeof input.honeypot === "string" ? input.honeypot.trim() : String(input.honeypot);
    if (honeypotVal.length > 0) {
      return { isBot: true, reason: "Honeypot field was filled." };
    }
  }

  // 2. Minimum submission time check (prevents sub-second automated scripted form fills)
  if (input.clientTimestamp && typeof input.clientTimestamp === "number") {
    const elapsedMs = Date.now() - input.clientTimestamp;
    // If form was submitted in less than 1.5 seconds, it is highly likely an automated script
    if (elapsedMs > 0 && elapsedMs < 1500) {
      return { isBot: true, reason: "Submission occurred too quickly." };
    }
  }

  // 3. Cloudflare Turnstile CAPTCHA (if configured)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!input.turnstileToken || typeof input.turnstileToken !== "string") {
      return { isBot: true, reason: "Missing CAPTCHA verification token." };
    }

    try {
      const formData = new URLSearchParams();
      formData.append("secret", turnstileSecret);
      formData.append("response", input.turnstileToken);
      if (clientIp) {
        formData.append("remoteip", clientIp);
      }

      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
      });

      const outcome = await res.json();
      if (!outcome.success) {
        return { isBot: true, reason: "CAPTCHA verification failed." };
      }
    } catch {
      // If Turnstile service is unreachable, fail securely
      return { isBot: true, reason: "Unable to verify CAPTCHA service." };
    }
  }

  return { isBot: false };
}

/**
 * Content spam check for excessive links or common spam injection phrases.
 */
export function checkContentSpam(content: string): boolean {
  if (!content) return false;

  // Excessive URLs (more than 3 URLs in enquiry)
  const urlMatches = content.match(/https?:\/\/[^\s]+/gi);
  if (urlMatches && urlMatches.length > 3) {
    return true;
  }

  // Common spam phrases
  const spamKeywords = [
    "seo ranking",
    "crypto investment",
    "buy backlinks",
    "viagra",
    "casino online",
    "guest posting services",
  ];

  const lower = content.toLowerCase();
  for (const phrase of spamKeywords) {
    if (lower.includes(phrase)) {
      return true;
    }
  }

  return false;
}
