import nodemailer from "nodemailer";

const createZohoTransport = () => {
  return nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST,
    port: Number(process.env.CONTACT_SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.CONTACT_SMTP_MAIL,
      pass: process.env.CONTACT_SMTP_PASSWORD,
    },
  });
};

export const sendMessageEmail = async ({ name, subject, message }) => {
  
    const adminEmail = process.env.CONTACT_SMTP_MAIL;

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
    const transporter = createZohoTransport();

    const info = await transporter.sendMail({
      from: process.env.CONTACT_SMTP_MAIL,
      to: adminEmail,
      subject,
      html: htmlBody,
    });

    console.log("📩 Zoho Contact email sent.");
    return info;

  } catch (err) {
    console.log("❌ Zoho SMTP Error:", err.message);
  }
};
