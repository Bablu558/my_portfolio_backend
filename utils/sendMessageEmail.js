import { Resend } from "resend";

export const sendMessageEmail = async ({ name, subject, message }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.CONTACT_SMTP_MAIL,
      subject,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    console.log("Resend email sent");
    return response;

  } catch (err) {
    console.log("Resend email error:", err.message);
  }
};
