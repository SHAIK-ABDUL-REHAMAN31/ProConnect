import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ENV } from "../../config/env.js";

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    dotenv.config();
    const user = process.env.SMTP_USER || ENV.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || ENV.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
    const host = process.env.SMTP_HOST || ENV.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || ENV.SMTP_PORT) || 587;

    if (user && pass) {
      // If using Gmail, 'service: gmail' is the most reliable transport config
      if (host.includes("gmail") || user.endsWith("@gmail.com")) {
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: user,
            pass: pass,
          },
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: host,
          port: port,
          secure: port === 465,
          auth: {
            user: user,
            pass: pass,
          },
        });
      }
      console.log(`[EmailService] Nodemailer SMTP initialized with user: ${user}`);
    } else {
      console.log("[EmailService] No SMTP credentials configured in backend/.env. OTPs will be logged to backend console.");
    }
  }

  /**
   * Send a 6-digit OTP verification email
   */
  async sendVerificationOtpEmail(toEmail, name = "Professional", otpCode) {
    if (!this.transporter) {
      this.initTransporter();
    }
    const sender = process.env.SMTP_USER || ENV.SMTP_USER;
    const fromAddress =
      process.env.SMTP_FROM ||
      ENV.SMTP_FROM ||
      (sender ? `"ProConnect" <${sender}>` : `"ProConnect Security" <noreply@proconnect.dev>`);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProConnect Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 580px;
      margin: 30px auto;
      background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
    }
    .content {
      padding: 36px 32px;
      text-align: center;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #ffffff;
      text-align: left;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 28px;
      text-align: left;
    }
    .otp-box {
      background: rgba(10, 102, 194, 0.12);
      border: 2px dashed #0a66c2;
      border-radius: 12px;
      padding: 20px;
      margin: 0 auto 28px;
      display: inline-block;
      letter-spacing: 12px;
      font-size: 36px;
      font-weight: 800;
      color: #38bdf8;
      font-family: 'Courier New', Courier, monospace;
    }
    .expiry {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .security-note {
      background: rgba(255, 255, 255, 0.03);
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      text-align: left;
      font-size: 13px;
      color: #94a3b8;
      border-radius: 4px;
      margin-bottom: 24px;
    }
    .footer {
      background: rgba(0, 0, 0, 0.3);
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ProConnect</h1>
      <p>Next-Generation Professional Social & Career Platform</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <div class="text">
        Thank you for joining ProConnect. Please use the following 6-digit verification code to confirm your email address and activate your account.
      </div>
      
      <div class="otp-box">${otpCode}</div>
      
      <div class="expiry">⏱️ This verification code is valid for <strong>10 minutes</strong>.</div>
      
      <div class="security-note">
        <strong>Security Notice:</strong> Never share this code with anyone. ProConnect staff will never ask for your verification code.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ProConnect Inc. All rights reserved. &bull; Protecting your professional identity.
    </div>
  </div>
</body>
</html>
    `;

    // If transporter is active, send via SMTP
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject: `${otpCode} is your ProConnect Verification Code`,
          text: `Your ProConnect verification code is ${otpCode}. Valid for 10 minutes.`,
          html: htmlContent,
        });
        console.log(`[EmailService] Verification OTP sent to ${toEmail} | MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId, deliveredVia: "smtp" };
      } catch (error) {
        console.error(`[EmailService] Failed to send email via SMTP:`, error.message);
        // Fall back to console logger
      }
    }

    // Development / Fallback console logger
    console.log("=================================================");
    console.log(`📧 [PROCONNECT EMAIL OTP] To: ${toEmail} (${name})`);
    console.log(`🔑 Verification Code: [ ${otpCode} ]`);
    console.log(`⏱️ Valid for 10 minutes`);
    console.log("=================================================");

    return {
      success: true,
      deliveredVia: "console_fallback",
      note: "SMTP credentials not configured or failed; OTP logged to backend console.",
    };
  }
}

export const emailService = new EmailService();
export default emailService;
