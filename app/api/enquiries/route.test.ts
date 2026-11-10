import assert from "node:assert/strict";
import { test } from "node:test";

import { POST } from "./route.ts";

const ENDPOINT = "http://localhost/api/enquiries";

function postEnquiry(
  rawBody: string,
  contentType = "application/json"
): Promise<Response> {
  return POST(
    new Request(ENDPOINT, {
      method: "POST",
      headers: { "content-type": contentType },
      body: rawBody,
    })
  );
}

const validEnquiry = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "555-0100",
  service: "Custom Embroidery",
  projectDetails: "50 embroidered polos",
};

test("valid enquiry returns 201", async () => {
  const response = await postEnquiry(JSON.stringify(validEnquiry));

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    message: "Enquiry received. Thank you for getting in touch.",
  });
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
  const response = await postEnquiry(
    JSON.stringify({ ...validEnquiry, projectDetails: "x".repeat(2000) })
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    message: "Enquiry received. Thank you for getting in touch.",
  });
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
    const response = await postEnquiry(
      JSON.stringify(validEnquiry),
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
