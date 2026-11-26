export interface EmailEnquiryData {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  service?: string;
  projectDetails: string;
  createdAt?: string;
}

export function generateAdminNotificationHtml(enquiry: EmailEnquiryData): string {
  const phoneDisplay = enquiry.phone?.trim() ? enquiry.phone : "Not provided";
  const serviceDisplay = enquiry.service?.trim() ? enquiry.service : "General Enquiry";
  const dateDisplay = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleString("en-US", {
        timeZone: "America/Chicago",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Enquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2933; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F7F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1F2933; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">LUCKY EMBROIDERY</h1>
              <p style="margin: 4px 0 0; color: #9AA5B1; font-size: 13px;">New Website Customer Enquiry</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 15px; color: #496B80; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">Enquiry Details</p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #F0F2F5;">
                  <td width="35%" style="color: #626B73; font-size: 13px; font-weight: 600; text-transform: uppercase;">Full Name</td>
                  <td width="65%" style="font-size: 14px; font-weight: 600; color: #1F2933;">${escapeHtml(enquiry.fullName)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F0F2F5;">
                  <td style="color: #626B73; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email</td>
                  <td style="font-size: 14px; color: #1F2933;"><a href="mailto:${escapeHtml(enquiry.email)}" style="color: #496B80; text-decoration: none;">${escapeHtml(enquiry.email)}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #F0F2F5;">
                  <td style="color: #626B73; font-size: 13px; font-weight: 600; text-transform: uppercase;">Phone</td>
                  <td style="font-size: 14px; color: #1F2933;">${escapeHtml(phoneDisplay)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F0F2F5;">
                  <td style="color: #626B73; font-size: 13px; font-weight: 600; text-transform: uppercase;">Service</td>
                  <td style="font-size: 14px; font-weight: 500; color: #1F2933;">${escapeHtml(serviceDisplay)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F0F2F5;">
                  <td style="color: #626B73; font-size: 13px; font-weight: 600; text-transform: uppercase;">Submitted At</td>
                  <td style="font-size: 13px; color: #626B73;">${escapeHtml(dateDisplay)}</td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #626B73; text-transform: uppercase;">Project Description</p>
              <div style="background-color: #F7F7F5; border-radius: 8px; padding: 16px; border: 1px solid #E5E7EB; font-size: 14px; color: #1F2933; white-space: pre-wrap; word-break: break-word;">${escapeHtml(enquiry.projectDetails)}</div>

              <div style="margin-top: 28px; text-align: center;">
                <a href="mailto:${escapeHtml(enquiry.email)}?subject=Re:%20Lucky%20Embroidery%20Quote" style="display: inline-block; background-color: #496B80; color: #FFFFFF; font-size: 14px; font-weight: 600; padding: 12px 28px; text-decoration: none; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">Reply to Client</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F7F5; padding: 16px 32px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9AA5B1;">
              Lucky Embroidery &bull; 10822 S Gessner Rd, Houston, TX 77071 &bull; (832) 940-2320
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateCustomerAcknowledgementHtml(enquiry: EmailEnquiryData): string {
  const serviceDisplay = enquiry.service?.trim() ? enquiry.service : "Custom Apparel";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Lucky Embroidery</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2933; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F7F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1F2933; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">LUCKY EMBROIDERY</h1>
              <p style="margin: 4px 0 0; color: #9AA5B1; font-size: 13px;">Custom Embroidery &amp; Screen Printing &bull; Houston, TX</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #1F2933;">We Received Your Enquiry!</h2>
              <p style="margin: 0 0 16px; font-size: 14px; color: #4B5563;">
                Hi ${escapeHtml(enquiry.fullName)},
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563;">
                Thank you for reaching out to Lucky Embroidery regarding your <strong>${escapeHtml(serviceDisplay)}</strong> project. Our team is reviewing your requirements and will get back to you with quote options shortly.
              </p>

              <div style="background-color: #F7F7F5; border-radius: 8px; padding: 20px; border: 1px solid #E5E7EB; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #496B80; text-transform: uppercase; letter-spacing: 0.08em;">Workshop Hours &amp; Location</h3>
                <p style="margin: 0 0 4px; font-size: 13px; color: #1F2933;"><strong>Address:</strong> 10822 S Gessner Rd, Houston, TX 77071</p>
                <p style="margin: 0 0 4px; font-size: 13px; color: #1F2933;"><strong>Hours:</strong> Mon&ndash;Fri: 9 AM &ndash; 6 PM | Saturday: 9 AM &ndash; 5 PM</p>
                <p style="margin: 0; font-size: 13px; color: #1F2933;"><strong>Phone:</strong> <a href="tel:+18329402320" style="color: #496B80; text-decoration: none;">(832) 940-2320</a></p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #626B73;">
                If your project is time-sensitive or you have urgent questions, please feel free to call our workshop directly.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F7F5; padding: 16px 32px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9AA5B1;">
              &copy; ${new Date().getFullYear()} Lucky Embroidery. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
