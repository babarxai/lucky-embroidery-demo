import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generateAdminNotificationHtml,
  generateCustomerAcknowledgementHtml,
} from "../lib/email/templates.ts";
import {
  verifyAntiBot,
  checkContentSpam,
} from "../lib/security/bot-protection.ts";

test("admin notification email template includes client details and safety escape", () => {
  const html = generateAdminNotificationHtml({
    id: "test-uuid-1234",
    fullName: "<script>alert(1)</script>John Doe",
    email: "john@example.com",
    phone: "555-0199",
    service: "Custom Embroidery",
    projectDetails: "50 jackets with embroidered logo",
  });

  assert.ok(html.includes("LUCKY EMBROIDERY"), "Includes header");
  assert.ok(html.includes("John Doe"), "Includes full name");
  assert.ok(!html.includes("<script>alert(1)</script>"), "HTML tags escaped");
  assert.ok(html.includes("&lt;script&gt;"), "Properly escaped entities");
  assert.ok(html.includes("50 jackets"), "Includes project details");
  assert.ok(html.includes("555-0199"), "Includes phone number");
});

test("customer acknowledgement template includes workshop details", () => {
  const html = generateCustomerAcknowledgementHtml({
    fullName: "Jane Smith",
    email: "jane@example.com",
    service: "Screen Printing",
    projectDetails: "20 t-shirts",
  });

  assert.ok(html.includes("We Received Your Enquiry!"), "Includes confirmation");
  assert.ok(html.includes("Jane Smith"), "Addresses customer by name");
  assert.ok(html.includes("10822 S Gessner Rd"), "Includes workshop address");
  assert.ok(html.includes("(832) 940-2320"), "Includes contact phone number");
});

test("anti-bot catches populated honeypot", async () => {
  const check = await verifyAntiBot({
    honeypot: "spam_bot_fill",
  });

  assert.equal(check.isBot, true);
  assert.equal(check.reason, "Honeypot field was filled.");
});

test("anti-bot allows empty honeypot and valid timing", async () => {
  const check = await verifyAntiBot({
    honeypot: "",
    clientTimestamp: Date.now() - 5000,
  });

  assert.equal(check.isBot, false);
});

test("anti-bot flags submissions faster than 1.5 seconds", async () => {
  const check = await verifyAntiBot({
    honeypot: "",
    clientTimestamp: Date.now() - 500, // only 500ms elapsed
  });

  assert.equal(check.isBot, true);
  assert.equal(check.reason, "Submission occurred too quickly.");
});

test("content spam detection flags known spam phrases", () => {
  assert.equal(checkContentSpam("Hello we offer buy backlinks cheap"), true);
  assert.equal(checkContentSpam("Get top seo ranking for your site"), true);
  assert.equal(checkContentSpam("Need 50 custom embroidered polo shirts for my company"), false);
});

test("content spam detection flags excessive URLs", () => {
  const spamMessage = "Check https://site1.com and https://site2.com and https://site3.com and https://site4.com";
  assert.equal(checkContentSpam(spamMessage), true);
});
