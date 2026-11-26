import crypto from "node:crypto";

export type Enquiry = {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  projectDetails: string;
};

export type EnquiryInsert = {
  full_name: string;
  email: string;
  phone: string;
  service: string;
  project_details: string;
  status?: string;
  ip_hash?: string;
  idempotency_key?: string;
};

export type InsertEnquiryFn = (
  record: EnquiryInsert
) => Promise<{ data?: { id?: string } | null; error: unknown }>;

type ValidationErrors = Partial<Record<keyof Enquiry, string>>;

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const MAX_BODY_BYTES = 16 * 1024;

const FIELD_LIMITS: Record<keyof Enquiry, number> = {
  fullName: 120,
  email: 254,
  phone: 32,
  service: 100,
  projectDetails: 2000,
};

const FIELD_LABELS: Record<keyof Enquiry, string> = {
  fullName: "Full name",
  email: "Email address",
  phone: "Phone number",
  service: "Service",
  projectDetails: "Project details",
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isJsonContentType(value: string | null): boolean {
  if (!value) return false;
  const mediaType = value.split(";")[0].trim().toLowerCase();
  return mediaType === "application/json" || mediaType.endsWith("+json");
}

async function readTextWithLimit(
  request: Request,
  maxBytes: number
): Promise<string | null> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return null;
    }
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let totalBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }

  return text + decoder.decode();
}

async function defaultInsertEnquiry(
  record: EnquiryInsert
): Promise<{ data?: { id?: string } | null; error: unknown }> {
  const { getTrustedServerClient } = await import("../../../lib/supabase/server.ts");
  const supabase = getTrustedServerClient();

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
      service: record.service,
      project_details: record.project_details,
      status: record.status || "new",
      ip_hash: record.ip_hash,
      idempotency_key: record.idempotency_key,
    })
    .select("id")
    .single();

  return { data, error };
}

export async function handleEnquiryPost(
  request: Request,
  insertEnquiry: InsertEnquiryFn = defaultInsertEnquiry
): Promise<Response> {
  if (!isJsonContentType(request.headers.get("content-type"))) {
    return Response.json(
      { message: "Content type must be application/json." },
      { status: 415 }
    );
  }

  const rawBody = await readTextWithLimit(request, MAX_BODY_BYTES);
  if (rawBody === null) {
    return Response.json(
      { message: "Request body is too large." },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json(
      { message: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;

  // Extract client IP
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Rate Limiting check (skip in explicit test environments if requested)
  if (process.env.NODE_ENV !== "test") {
    const { checkRateLimit } = await import("../../../lib/security/rate-limit.ts");
    const rateLimit = await checkRateLimit(clientIp);
    if (!rateLimit.success) {
      return Response.json(
        { message: "Too many enquiries from your connection. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
          },
        }
      );
    }
  }

  // Anti-bot & honeypot verification
  const { verifyAntiBot, checkContentSpam } = await import(
    "../../../lib/security/bot-protection.ts"
  );
  const botCheck = await verifyAntiBot(
    {
      honeypot: input.honeypot || input.faxNumber || input.website,
      clientTimestamp: input.clientTimestamp,
      turnstileToken: input.turnstileToken,
    },
    clientIp
  );

  if (botCheck.isBot) {
    return Response.json(
      { message: "Automated submission detected. Verification failed." },
      { status: 400 }
    );
  }

  const enquiry: Enquiry = {
    fullName: asTrimmedString(input.fullName),
    email: asTrimmedString(input.email),
    phone: asTrimmedString(input.phone),
    service: asTrimmedString(input.service),
    projectDetails: asTrimmedString(input.projectDetails),
  };

  const errors: ValidationErrors = {};

  if (!enquiry.fullName) {
    errors.fullName = "Please enter your full name.";
  }

  if (!enquiry.email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(enquiry.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!enquiry.projectDetails) {
    errors.projectDetails = "Please describe your project or requirements.";
  } else if (checkContentSpam(enquiry.projectDetails)) {
    errors.projectDetails = "Please provide a valid project description.";
  }

  for (const field of Object.keys(FIELD_LIMITS) as (keyof Enquiry)[]) {
    if (!errors[field] && enquiry[field].length > FIELD_LIMITS[field]) {
      errors[field] = `${FIELD_LABELS[field]} must be ${FIELD_LIMITS[field]} characters or fewer.`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { message: "Validation failed.", errors },
      { status: 400 }
    );
  }

  // Production Safety Switch:
  // If explicitly disabled via ENQUIRIES_ENABLED === "false", acknowledge receipt without DB insertion.
  if (process.env.ENQUIRIES_ENABLED === "false") {
    return Response.json(
      { message: "Enquiry received. Thank you for getting in touch." },
      { status: 201 }
    );
  }

  // Generate deterministic idempotency key for retry deduplication
  const idempotencyKey =
    (typeof input.idempotencyKey === "string" && input.idempotencyKey) ||
    crypto
      .createHash("sha256")
      .update(`${enquiry.email.toLowerCase()}|${enquiry.projectDetails.slice(0, 100)}|${Math.floor(Date.now() / 60000)}`)
      .digest("hex");

  const { hashIp } = await import("../../../lib/security/rate-limit.ts");
  const ipHash = hashIp(clientIp);

  let insertedId: string | undefined;

  try {
    const { data, error } = await insertEnquiry({
      full_name: enquiry.fullName,
      email: enquiry.email,
      phone: enquiry.phone,
      service: enquiry.service,
      project_details: enquiry.projectDetails,
      status: "new",
      ip_hash: ipHash,
      idempotency_key: idempotencyKey,
    });

    if (error) {
      const err = error as { code?: string; message?: string };
      // If error is unique violation on idempotency_key, treat as successful duplicate submit
      if (err.code === "23505") {
        return Response.json(
          { message: "Enquiry received. Thank you for getting in touch." },
          { status: 201 }
        );
      }

      console.error("[enquiries] Database insert failed.");
      return Response.json(
        { message: "Unable to submit your enquiry right now. Please try again later." },
        { status: 500 }
      );
    }

    insertedId = data?.id;
  } catch {
    console.error("[enquiries] Unexpected database error.");
    return Response.json(
      { message: "Unable to submit your enquiry right now. Please try again later." },
      { status: 500 }
    );
  }

  // Dispatch background email notifications (Resend)
  try {
    const { sendEnquiryNotifications } = await import("../../../lib/email/service.ts");
    await sendEnquiryNotifications({
      id: insertedId,
      fullName: enquiry.fullName,
      email: enquiry.email,
      phone: enquiry.phone,
      service: enquiry.service,
      projectDetails: enquiry.projectDetails,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Email failure must never rollback or fail a successful enquiry storage
  }

  return Response.json(
    {
      message: "Enquiry received. Thank you for getting in touch.",
      enquiryId: insertedId,
    },
    { status: 201 }
  );
}
