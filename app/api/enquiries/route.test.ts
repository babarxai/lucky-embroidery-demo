import assert from "node:assert/strict";
import { test } from "node:test";

import { POST } from "./route.ts";

const ENDPOINT = "http://localhost/api/enquiries";

function postEnquiry(rawBody: string): Promise<Response> {
  return POST(
    new Request(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
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
