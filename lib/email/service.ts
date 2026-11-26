import "server-only";

import { Resend } from "resend";
import { getTrustedServerClient } from "../supabase/server.ts";
import {
  EmailEnquiryData,
  generateAdminNotificationHtml,
  generateCustomerAcknowledgementHtml,
} from "./templates.ts";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "Lucky Embroidery <enquiries@luckyembroidery.com>";
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@luckyembroidery.com";
const customerAckEnabled = process.env.CUSTOMER_ACKNOWLEDGEMENT_ENABLED === "true";

// Lazy-instantiate Resend client
let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  if (!resendApiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
}

export interface NotificationResult {
  adminNotification: { status: "sent" | "failed" | "skipped"; id?: string; error?: string };
  customerAck?: { status: "sent" | "failed" | "skipped"; id?: string; error?: string };
}

/**
 * Sends notification emails for a newly received enquiry.
 * Never throws an uncaught error to ensure database enquiry persistence is never erased.
 */
export async function sendEnquiryNotifications(
  enquiry: EmailEnquiryData
): Promise<NotificationResult> {
  const result: NotificationResult = {
    adminNotification: { status: "skipped" },
  };

  const client = getResendClient();
  const supabase = getTrustedServerClient();

  // 1. Admin Notification
  try {
    if (!client) {
      // Record pending notification in database for later retry when key is configured
      if (enquiry.id && process.env.NODE_ENV !== "test") {
        await supabase.from("enquiry_notifications").insert({
          enquiry_id: enquiry.id,
          type: "admin_notification",
          recipient: adminEmail,
          subject: `New Website Enquiry: ${enquiry.fullName}`,
          status: "pending",
          error_message: "RESEND_API_KEY not configured",
        });
      }
      result.adminNotification = {
        status: "skipped",
        error: "RESEND_API_KEY not configured",
      };
    } else {
      const { data, error } = await client.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New Website Enquiry: ${enquiry.fullName} - ${enquiry.service || "Embroidery"}`,
        html: generateAdminNotificationHtml(enquiry),
      });

      if (error) {
        if (enquiry.id) {
          await supabase.from("enquiry_notifications").insert({
            enquiry_id: enquiry.id,
            type: "admin_notification",
            recipient: adminEmail,
            subject: `New Website Enquiry: ${enquiry.fullName}`,
            status: "failed",
            attempts: 1,
            error_message: error.message,
          });
        }
        result.adminNotification = { status: "failed", error: error.message };
      } else {
        if (enquiry.id) {
          await supabase.from("enquiry_notifications").insert({
            enquiry_id: enquiry.id,
            type: "admin_notification",
            recipient: adminEmail,
            subject: `New Website Enquiry: ${enquiry.fullName}`,
            status: "sent",
            attempts: 1,
            sent_at: new Date().toISOString(),
          });
        }
        result.adminNotification = { status: "sent", id: data?.id };
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unexpected email error";
    result.adminNotification = { status: "failed", error: errorMsg };
  }

  // 2. Customer Acknowledgement (if enabled)
  if (customerAckEnabled && enquiry.email) {
    try {
      if (!client) {
        result.customerAck = { status: "skipped", error: "RESEND_API_KEY not configured" };
      } else {
        const { data, error } = await client.emails.send({
          from: fromEmail,
          to: enquiry.email,
          subject: "Thank You for Contacting Lucky Embroidery",
          html: generateCustomerAcknowledgementHtml(enquiry),
        });

        if (error) {
          if (enquiry.id) {
            await supabase.from("enquiry_notifications").insert({
              enquiry_id: enquiry.id,
              type: "customer_acknowledgement",
              recipient: enquiry.email,
              subject: "Thank You for Contacting Lucky Embroidery",
              status: "failed",
              attempts: 1,
              error_message: error.message,
            });
          }
          result.customerAck = { status: "failed", error: error.message };
        } else {
          if (enquiry.id) {
            await supabase.from("enquiry_notifications").insert({
              enquiry_id: enquiry.id,
              type: "customer_acknowledgement",
              recipient: enquiry.email,
              subject: "Thank You for Contacting Lucky Embroidery",
              status: "sent",
              attempts: 1,
              sent_at: new Date().toISOString(),
            });
          }
          result.customerAck = { status: "sent", id: data?.id };
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unexpected email error";
      result.customerAck = { status: "failed", error: errorMsg };
    }
  }

  return result;
}

/**
 * Retries sending a failed notification record.
 */
export async function retryNotificationRecord(notificationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getTrustedServerClient();

  const { data: record, error: fetchErr } = await supabase
    .from("enquiry_notifications")
    .select("*, enquiries(*)")
    .eq("id", notificationId)
    .single();

  if (fetchErr || !record) {
    return { success: false, error: "Notification record not found." };
  }

  const client = getResendClient();
  if (!client) {
    return { success: false, error: "RESEND_API_KEY is not configured." };
  }

  const enquiry = record.enquiries;
  const emailData: EmailEnquiryData = {
    id: enquiry.id,
    fullName: enquiry.full_name,
    email: enquiry.email,
    phone: enquiry.phone,
    service: enquiry.service,
    projectDetails: enquiry.project_details,
    createdAt: enquiry.created_at,
  };

  const html =
    record.type === "customer_acknowledgement"
      ? generateCustomerAcknowledgementHtml(emailData)
      : generateAdminNotificationHtml(emailData);

  const { error: sendErr } = await client.emails.send({
    from: fromEmail,
    to: record.recipient,
    subject: record.subject,
    html,
  });

  const nextAttempts = (record.attempts || 0) + 1;

  if (sendErr) {
    await supabase
      .from("enquiry_notifications")
      .update({
        attempts: nextAttempts,
        status: "failed",
        error_message: sendErr.message,
      })
      .eq("id", notificationId);

    return { success: false, error: sendErr.message };
  }

  await supabase
    .from("enquiry_notifications")
    .update({
      attempts: nextAttempts,
      status: "sent",
      sent_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", notificationId);

  return { success: true };
}
