type Enquiry = {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  projectDetails: string;
};

type RequiredField = "fullName" | "email" | "projectDetails";

type ValidationErrors = Partial<Record<RequiredField, string>>;

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
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

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { message: "Validation failed.", errors },
      { status: 400 }
    );
  }

  // Demo mode: enquiries are intentionally not stored or transmitted anywhere.
  return Response.json(
    { message: "Enquiry received. Thank you for getting in touch." },
    { status: 201 }
  );
}
