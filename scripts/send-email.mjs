import nodemailer from "nodemailer";

const fromEmail = process.env.EMAIL;
const password = process.env.EMAIL_PASSWORD;
const host = process.env.EMAIL_HOST || "smtp.gmail.com";
const to = process.argv[2] || "aniketsubudhi00@gmail.com";
const subject = process.argv[3] || "Hello from CCC — Centurion Coffee Connect";
const text =
  process.argv[4] ||
  "This is a test email from Centurion Coffee Connect (CCC).";

if (!fromEmail || !password) {
  console.error("Missing EMAIL or EMAIL_PASSWORD in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port: 587,
  secure: false,
  auth: {
    user: fromEmail,
    pass: password,
  },
});

const info = await transporter.sendMail({
  from: `"CCC — Centurion Coffee Connect" <${fromEmail}>`,
  to,
  subject,
  text,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
      <h2 style="margin-bottom: 8px;">CCC</h2>
      <p style="color: #6b7280; margin-top: 0;">Centurion Coffee Connect</p>
      <p>${text}</p>
      <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
        Sent from ${fromEmail}
      </p>
    </div>
  `,
});

console.log(`Email sent to ${to}`);
console.log(`Message ID: ${info.messageId}`);
