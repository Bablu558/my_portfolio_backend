import nodemailer from "nodemailer";
import { Resend } from "resend";

const createNodemailerTransport = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendResetPasswordEmail = async ({
  email,
  name,
  resetUrl,
  expiresIn = "15 minutes",
}) => {
  console.log("🔐 sendResetPasswordEmail called for:", email);

  const htmlBody = `
  <div style="font-family:Arial, sans-serif; max-width:600px; margin:auto; padding:30px; background:#ffffff; border-radius:10px; border:1px solid #e5e7eb;">
    
    <h2 style="text-align:center; color:#0f172a;">
      🔐 Reset Your TechBlog Password
    </h2>

    <p style="font-size:15px; color:#334155;">
      Hi <strong>${name || "User"}</strong>,
    </p>

    <p style="font-size:15px; color:#334155;">
      We received a request to reset your <strong>TechBlog</strong> account password.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <a href="${resetUrl}"
        style="
          background:#2563eb;
          color:#ffffff;
          padding:12px 22px;
          border-radius:6px;
          text-decoration:none;
          font-weight:bold;
          font-size:15px;
          display:inline-block;
        ">
        Reset Password
      </a>
    </div>

    <p style="font-size:14px; color:#dc2626; font-weight:bold;">
      ⏳ This reset link will expire in ${expiresIn}.
    </p>

    <p style="font-size:14px; color:#475569;">
      If the button does not work, copy and paste this link into your browser:
    </p>

    <p style="word-break:break-all; font-size:13px;">
      <a href="${resetUrl}">${resetUrl}</a>
    </p>

    <hr style="margin:25px 0;" />

    <p style="font-size:13px; color:#64748b;">
      🚫 If you did not request this password reset, please ignore this email.  
      Your account remains secure.
    </p>

    <p style="font-size:14px; color:#334155; margin-top:25px;">
      Thanks,<br/>
      <strong>TechBlog Team</strong>
    </p>
  </div>
  `;

  // 1️⃣ Try Resend first
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const response = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Reset Your TechBlog Password",
        html: htmlBody,
      });

      if (response?.error) {
        throw new Error(response.error.message);
      }

      console.log("✅ Reset password email sent via Resend");
      return;
    } catch (err) {
      console.log("⚠️ Resend failed, switching to SMTP:", err.message);
    }
  }

  // 2️⃣ SMTP fallback
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_MAIL &&
    process.env.SMTP_PASSWORD
  ) {
    const transporter = createNodemailerTransport();

    await transporter.sendMail({
      from: `${process.env.SEND_NAME || "TechBlog"} <${process.env.SMTP_MAIL}>`,
      to: email,
      subject: "Reset Your TechBlog Password",
      html: htmlBody,
    });

    console.log("✅ Reset password email sent via SMTP");
    return;
  }

  throw new Error("No email provider configured for reset password");
};
