import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  console.log("📧 Sending email to:", options.email);
  console.log("Using SMTP:", process.env.SMTP_HOST);
  console.log("Using SMTP MAIL:", process.env.SMTP_MAIL);

  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT), // 👈 important!
      secure: false, // Zoho needs SSL on port 465
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    console.log("📡 Transporter created successfully");

    const mailOptions = {
      from: `TechBlog <${process.env.SMTP_MAIL}>`,
      to: options.email,
      subject: options.subject,

      // ⭐ Your UI remains SAME
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
          <a href="${options.url}">${options.url}</a>
        </p>

        <p style="color:red; font-weight:bold; margin-top:10px;">
          ⏳ This verification link will expire in <strong>${options.expiresIn || "10 minutes"}</strong>.
        </p>
        
        <br>
        <p>If you did not request this email, simply ignore it.</p>

        <p>Thanks,<br>TechBlog Team</p>
      </div>
    `,
      text: options.message,
    };

    console.log("📨 Mail options prepared");

    const response = await transporter.sendMail(mailOptions);

    console.log("✅ Email Sent Successfully");
    console.log("📧 SMTP Response:", response);

  } catch (error) {
    console.log("❌ EMAIL SENDING FAILED");
    console.log("❌ ERROR MESSAGE:", error.message);
    console.log("❌ FULL ERROR OBJECT:", error);

    // throw error so your controller can show correct error to frontend
    throw new Error("Email sending failed: " + error.message);
  }
};
