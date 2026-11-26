type Enquiry = {
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
};

export type InsertEnquiryFn = (
  record: EnquiryInsert
) => Promise<{ error: unknown }>;

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
  if (!value) {
    return false;
  }

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

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let totalBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

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
): Promise<{ error: unknown }> {
  const { supabase } = await import("@/lib/supabase/server");
  const { error } = await supabase.from("enquiries").insert(record);
  return { error };
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

  // Production safety switch:
  // In demo mode (default when ENQUIRIES_ENABLED !== "true"), validated enquiries
  // are acknowledged without persisting to Supabase to prevent unauthorized
  // data collection in public/unprotected environments.
  if (process.env.ENQUIRIES_ENABLED !== "true") {
    return Response.json(
      { message: "Enquiry received. Thank you for getting in touch." },
      { status: 201 }
    );
  }

  try {
    const { error } = await insertEnquiry({
      full_name: enquiry.fullName,
      email: enquiry.email,
      phone: enquiry.phone,
      service: enquiry.service,
      project_details: enquiry.projectDetails,
    });

    if (error) {
      console.error("[enquiries] Database insert failed.");
      return Response.json(
        {
          message:
            "Unable to submit your enquiry right now. Please try again later.",
        },
        { status: 500 }
      );
    }
  } catch {
    console.error("[enquiries] Unexpected database error.");
    return Response.json(
      {
        message:
          "Unable to submit your enquiry right now. Please try again later.",
      },
      { status: 500 }
    );
  }

  return Response.json(
    { message: "Enquiry received. Thank you for getting in touch." },
    { status: 201 }
  );
}
