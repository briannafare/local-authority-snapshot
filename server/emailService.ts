import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachmentUrl?: string;
}

/**
 * Send an email using Gmail MCP
 * @param options Email options including recipient, subject, body, and optional attachment URL
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, body, attachmentUrl } = options;

    // Construct the email payload
    const emailPayload: any = {
      to,
      subject,
      body,
    };

    // Add attachment if provided
    if (attachmentUrl) {
      emailPayload.attachmentUrl = attachmentUrl;
    }

    // Call Gmail MCP to send email
    const command = `manus-mcp-cli tool call send_email --server gmail --input '${JSON.stringify(emailPayload).replace(/'/g, "'\\''")}'`;
    
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error("[Email] Gmail MCP error:", stderr);
      return false;
    }

    console.log("[Email] Email sent successfully:", stdout);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Send audit report email to user
 * @param email User's email address
 * @param businessName Business name for personalization
 * @param pdfUrl URL to the PDF report
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendAuditReportEmail(
  email: string,
  businessName: string,
  pdfUrl: string
): Promise<boolean> {
  const subject = `Your Local Authority Snapshot Report for ${businessName}`;
  
  const body = `
Hi there,

Your comprehensive Local Authority Snapshot report for ${businessName} is ready!

This report includes:
• SEO & AEO visibility analysis
• Competitive positioning insights
• Lead capture opportunities
• Revenue recapture recommendations
• Actionable implementation roadmap

You can view your report online or download the PDF attachment.

Report URL: ${pdfUrl}

Questions? Reply to this email and we'll be happy to help.

Best regards,
The eighty5labs Team

---
eighty5labs — Agentic Marketing Infrastructure
Your marketing runs itself. Your revenue doesn't sleep.
  `.trim();

  return await sendEmail({
    to: email,
    subject,
    body,
    attachmentUrl: pdfUrl,
  });
}
