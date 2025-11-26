import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  console.log("📧 Sending email to:", options.email);
    console.log("Using SMTP:", process.env.SMTP_HOST);
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    
    secure:true,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `TechBlog <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,

    // ⭐ HTML + Text Both Added
    html: `
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

        <p>
          <a href="${options.url}">
            ${options.url}
          </a>
        </p>

        <p style="color:red; font-weight:bold; margin-top:10px;">
      ⏳ This verification link will expire in <strong>${options.expiresIn || "10 minutes"}</strong>.
    </p>
        <br>
        <p>If you did not request this email, simply ignore it.</p>

        <p>Thanks,<br>TechBlog Team</p>
      </div>
    `,

    // fallback (optional, for some clients)
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
