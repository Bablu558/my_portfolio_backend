import { Resend } from "resend";

export const sendMessageEmail = async ({ name, subject, message,email  }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.CONTACT_SMTP_MAIL;

  // 🔥 Beautiful Dark UI Email HTML
  const htmlBody = `
  <div style="
    font-family: 'Arial', sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 25px;
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 12px;
    border: 1px solid #1e293b;
  ">

    <h2 style="
      text-align:center;
      color:#38bdf8;
      margin-bottom:25px;
      font-size:28px;
      letter-spacing:1px;
    ">
      📬 New Contact Message
    </h2>

    <div style="
      background:#1e293b;
      padding:20px;
      border-radius:10px;
      margin-bottom:20px;
    ">
      <p style="margin:0; font-size:16px;">
        <strong style="color:#38bdf8;">Name:</strong> ${name}
      </p>
      <p style="margin-top:12px; font-size:16px;">
        <strong style="color:#38bdf8;">Subject:</strong> ${subject}
      </p>
        <p>${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
         </p>
      <p style="margin-top:12px; font-size:16px;">
        <strong style="color:#38bdf8;">Message:</strong>
      </p>
  
      <p style="
        margin-top:6px;
        padding:12px;
        background:#0f172a;
        border-left:4px solid #38bdf8;
        border-radius:6px;
        white-space:pre-wrap;
        font-size:15px;
      ">
        ${message}
      </p>
    </div>

    <p style="text-align:center; color:#64748b; font-size:14px; margin-top:20px;">
      Sent from your Portfolio Contact Form.
    </p>
  </div>
  `;

  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: adminEmail,
      subject,
      html: htmlBody,
    });

    console.log("📩 Resend contact email sent.");
    return response;

  } catch (err) {
    console.log("❌ Resend Email Error:", err.message);
  }
};
