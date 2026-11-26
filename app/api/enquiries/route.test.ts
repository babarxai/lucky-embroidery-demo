(process.env as Record<string, string | undefined>).NODE_ENV = "test";

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  handleEnquiryPost,
  type EnquiryInsert,
  type InsertEnquiryFn,
} from "./handler.ts";
import { POST } from "./route.ts";

const ENDPOINT = "http://localhost/api/enquiries";

function createRequest(
  rawBody: string,
  contentType = "application/json"
): Request {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "content-type": contentType },
    body: rawBody,
  });
}

function postEnquiry(
  rawBody: string,
  contentType = "application/json"
): Promise<Response> {
  return POST(createRequest(rawBody, contentType));
}

function postEnquiryWithInsert(
  rawBody: string,
  insertEnquiry: InsertEnquiryFn,
  contentType = "application/json"
): Promise<Response> {
  return handleEnquiryPost(createRequest(rawBody, contentType), insertEnquiry);
}

const validEnquiry = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "555-0100",
  service: "Custom Embroidery",
  projectDetails: "50 embroidered polos",
};

test("valid enquiry returns 201 and persists trimmed fields", async () => {
  const inserted: EnquiryInsert[] = [];
  const response = await postEnquiryWithInsert(
    JSON.stringify({
      fullName: "  Jane Doe  ",
      email: "  jane@example.com  ",
      phone: "  555-0100  ",
      service: "  Custom Embroidery  ",
      projectDetails: "  50 embroidered polos  ",
    }),
    async (record) => {
      inserted.push(record);
      return { data: { id: "mock-uuid-1234" }, error: null };
    }
  );

  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.message, "Enquiry received. Thank you for getting in touch.");
  assert.equal(data.enquiryId, "mock-uuid-1234");
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].full_name, "Jane Doe");
  assert.equal(inserted[0].email, "jane@example.com");
  assert.equal(inserted[0].phone, "555-0100");
  assert.equal(inserted[0].service, "Custom Embroidery");
  assert.equal(inserted[0].project_details, "50 embroidered polos");
});

test("duplicate idempotency key returns 201 without throwing error", async () => {
  const response = await postEnquiryWithInsert(
    JSON.stringify(validEnquiry),
    async () => ({
      data: null,
      error: { code: "23505", message: "duplicate key value violates unique constraint" },
    })
  );

  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.message, "Enquiry received. Thank you for getting in touch.");
});

test("honeypot bot submission returns 400", async () => {
  let called = false;
  const response = await postEnquiryWithInsert(
    JSON.stringify({
      ...validEnquiry,
      faxNumber: "bot-automated-value",
    }),
    async () => {
      called = true;
      return { data: { id: "1" }, error: null };
    }
  );

  assert.equal(response.status, 400);
  assert.equal(called, false);
  const data = await response.json();
  assert.equal(data.message, "Automated submission detected. Verification failed.");
});

test("missing fullName returns 400", async () => {
  const response = await postEnquiry(
    JSON.stringify({
      email: validEnquiry.email,
      projectDetails: validEnquiry.projectDetails,
    })
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Validation failed.",
    errors: { fullName: "Please enter your full name." },
  });
});

test("invalid email returns 400", async () => {
  const response = await postEnquiry(
    JSON.stringify({ ...validEnquiry, email: "not-an-email" })
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Validation failed.",
    errors: { email: "Please enter a valid email address." },
  });
});

test("missing projectDetails returns 400", async () => {
  const response = await postEnquiry(
    JSON.stringify({
      fullName: validEnquiry.fullName,
      email: validEnquiry.email,
    })
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Validation failed.",
    errors: {
      projectDetails: "Please describe your project or requirements.",
    },
  });
});

test("malformed JSON returns 400", async () => {
  const response = await postEnquiry('{"fullName": "Jane Doe",');

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Request body must be valid JSON.",
  });
});

test("non-object JSON body returns 400", async () => {
  for (const rawBody of ["null", "[]", '"just a string"', "42"]) {
    const response = await postEnquiry(rawBody);

    assert.equal(response.status, 400, `body: ${rawBody}`);
    assert.deepEqual(
      await response.json(),
      { message: "Request body must be a JSON object." },
      `body: ${rawBody}`
    );
  }
});

test("non-JSON content type returns 415", async () => {
  const response = await postEnquiry(
    JSON.stringify(validEnquiry),
    "text/plain"
  );

  assert.equal(response.status, 415);
  assert.deepEqual(await response.json(), {
    message: "Content type must be application/json.",
  });
});

test("oversized body returns 413", async () => {
  const response = await postEnquiry(
    JSON.stringify({ ...validEnquiry, padding: "x".repeat(17 * 1024) })
  );

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    message: "Request body is too large.",
  });
});

test("oversized field returns 400", async () => {
  const response = await postEnquiry(
    JSON.stringify({ ...validEnquiry, projectDetails: "x".repeat(2001) })
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Validation failed.",
    errors: {
      projectDetails: "Project details must be 2000 characters or fewer.",
    },
  });
});

test("field at the length limit returns 201", async () => {
  const response = await postEnquiryWithInsert(
    JSON.stringify({ ...validEnquiry, projectDetails: "x".repeat(2000) }),
    async () => ({ data: { id: "len-test" }, error: null })
  );

  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.message, "Enquiry received. Thank you for getting in touch.");
});

test("each field enforces its length limit", async () => {
  const cases: Array<[keyof typeof validEnquiry, number, string]> = [
    ["fullName", 120, "Full name must be 120 characters or fewer."],
    ["email", 254, "Email address must be 254 characters or fewer."],
    ["phone", 32, "Phone number must be 32 characters or fewer."],
    ["service", 100, "Service must be 100 characters or fewer."],
    ["projectDetails", 2000, "Project details must be 2000 characters or fewer."],
  ];

  for (const [field, limit, message] of cases) {
    const value =
      field === "email"
        ? `${"a".repeat(limit - 11)}@example.com`
        : "x".repeat(limit + 1);
    const response = await postEnquiry(
      JSON.stringify({ ...validEnquiry, [field]: value })
    );

    assert.equal(response.status, 400, field);
    assert.deepEqual(
      await response.json(),
      { message: "Validation failed.", errors: { [field]: message } },
      field
    );
  }
});

test("whitespace-only required fields return 400", async () => {
  const cases = [
    {
      field: "fullName",
      body: { ...validEnquiry, fullName: "   " },
      message: "Please enter your full name.",
    },
    {
      field: "email",
      body: { ...validEnquiry, email: " \t " },
      message: "Please enter your email address.",
    },
    {
      field: "projectDetails",
      body: { ...validEnquiry, projectDetails: " \n " },
      message: "Please describe your project or requirements.",
    },
  ];

  for (const { field, body, message } of cases) {
    const response = await postEnquiry(JSON.stringify(body));

    assert.equal(response.status, 400, field);
    assert.deepEqual(
      await response.json(),
      { message: "Validation failed.", errors: { [field]: message } },
      field
    );
  }
});

test("non-string required fields return 400", async () => {
  for (const value of [123, null, ["Jane"], { name: "Jane" }, true]) {
    const response = await postEnquiry(
      JSON.stringify({ ...validEnquiry, fullName: value })
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      message: "Validation failed.",
      errors: { fullName: "Please enter your full name." },
    });
  }
});

test("accepts JSON content types with parameters and vendor suffix", async () => {
  for (const contentType of [
    "application/json; charset=utf-8",
    "application/vnd.api+json",
  ]) {
    const response = await postEnquiryWithInsert(
      JSON.stringify(validEnquiry),
      async () => ({ data: { id: "test" }, error: null }),
      contentType
    );

    assert.equal(response.status, 201, contentType);
  }
});

test("empty body returns 400", async () => {
  const response = await postEnquiry("");

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Request body must be valid JSON.",
  });
});

test("database error returns 500 without exposing internal details", async () => {
  const response = await postEnquiryWithInsert(
    JSON.stringify(validEnquiry),
    async () => ({
      data: null,
      error: {
        code: "42501",
        message: 'new row violates row-level security policy for table "enquiries"',
        details: "Failing row contains (...)",
      },
    })
  );

  assert.equal(response.status, 500);
  const body = await response.json();
  assert.deepEqual(body, {
    message: "Unable to submit your enquiry right now. Please try again later.",
  });
  assert.equal(JSON.stringify(body).includes("42501"), false);
  assert.equal(JSON.stringify(body).includes("row-level security"), false);
});

test("unexpected database exception returns 500 without exposing internal details", async () => {
  const response = await postEnquiryWithInsert(
    JSON.stringify(validEnquiry),
    async () => {
      throw new Error("ECONNREFUSED 127.0.0.1:5432");
    }
  );

  assert.equal(response.status, 500);
  const body = await response.json();
  assert.deepEqual(body, {
    message: "Unable to submit your enquiry right now. Please try again later.",
  });
  assert.equal(JSON.stringify(body).includes("ECONNREFUSED"), false);
});

test("when ENQUIRIES_ENABLED is false, valid enquiry returns 201 without invoking insert", async () => {
  const prev = process.env.ENQUIRIES_ENABLED;
  process.env.ENQUIRIES_ENABLED = "false";
  try {
    let called = false;
    const response = await postEnquiryWithInsert(
      JSON.stringify(validEnquiry),
      async () => {
        called = true;
        return { data: { id: "mock" }, error: null };
      }
    );

    assert.equal(response.status, 201);
    assert.equal(called, false);
  } finally {
    process.env.ENQUIRIES_ENABLED = prev;
  }
});
