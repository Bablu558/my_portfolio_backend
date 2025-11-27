
import { Resend } from "resend";
import nodemailer from "nodemailer";

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

export const sendEmail = async (options) => {
  console.log("📧 sendEmail called for:", options.email);
  console.log("Environment - RESEND:", !!process.env.RESEND_API_KEY, "SMTP:", !!process.env.SMTP_HOST);

 
  const htmlBody = `
    <div style="font-family:Arial, sans-serif; padding:20px; line-height:1.7;">
      <h2>Welcome ${options.name || ""}!</h2>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${options.url}"
        style="
          display:inline-block;
          background:#0d6efd;
          color:white;
          padding:10px 18px;
          border-radius:5px;
          text-decoration:none;
          font-weight:bold;
          margin:10px 0;
        ">
        Verify Email
      </a>
      <p>If the button doesn’t work, use this link:</p>
      <p><a href="${options.url}">${options.url}</a></p>
      <p style="color:red; font-weight:bold; margin-top:10px;">
        ⏳ This verification link will expire in <strong>${options.expiresIn || "10 minutes"}</strong>.
      </p>
      <br>
      <p>If you did not request this email, simply ignore it.</p>
      <p>Thanks,<br>TechBlog Team</p>
    </div>
  `;

  
  if (process.env.RESEND_API_KEY) {
    try {
      console.log("🔁 Trying Resend...");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const response = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: options.email,
        subject: options.subject,
        html: htmlBody,
        
      });

      if (response && response.error) {
        console.log("⚠️ Resend returned error object:", response.error);
        throw new Error(response.error.message || "Resend error");
      }

      console.log("✅ Resend email sent:", response);
      return response;
    } catch (resendErr) {
      console.log("❌ Resend failed:", resendErr.message || resendErr);
    }
  } else {
    console.log("ℹ️ RESEND_API_KEY not provided - skipping Resend.");
  }

  if (process.env.SMTP_HOST && process.env.SMTP_MAIL && process.env.SMTP_PASSWORD) {
    try {
      console.log("🔁 Using SMTP fallback:", process.env.SMTP_HOST, process.env.SMTP_MAIL);
      const transporter = createNodemailerTransport();

      try {
        await transporter.verify();
        console.log("📡 SMTP transporter verified");
      } catch (verifyErr) {
        console.log("⚠️ SMTP transporter verify failed:", verifyErr.message || verifyErr);
      }

      const mailOptions = {
        from: `${process.env.SEND_NAME || "TechBlog"} <${process.env.SMTP_MAIL}>`,
        to: options.email,
        subject: options.subject,
        html: htmlBody,
        text: options.message || "",
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ SMTP email sent:", info);
      return info;
    } catch (smtpErr) {
      console.log("❌ SMTP sending failed:", smtpErr);
      throw new Error("Email sending failed (SMTP): " + (smtpErr.message || smtpErr));
    }
  }
  throw new Error("No email provider configured. Set RESEND_API_KEY or SMTP_* env variables.");
};
