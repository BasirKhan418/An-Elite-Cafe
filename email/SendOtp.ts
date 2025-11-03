import ConnectEmailClient from "../middleware/connectEmailClient"
export const sendOtpEmail = async (name:string,email: string, otp: string) => {
try{
 const transporter = await ConnectEmailClient();
 if(!transporter){
    return { message: "Email transporter not configured", success: false };
 }
 const info = await transporter.sendMail({
      from: `Elite Cafe `,
      to: `${email}`,
      subject: `Your Elite Cafe Verification Code`,
      text: `Hello ${name},\n\nYour One-Time Password (OTP) is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn’t request this, please ignore this email.`,
      html: `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>GT-Tech Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Inter',Arial,Helvetica,sans-serif;">

<!-- Container -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
  <tr>
    <td align="center">
      <table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#1f2937;padding:24px;text-align:center;">
            <img src="https://www.devsomeware.com/logo.png" alt="dsw Logo" style="max-width:140px;height:auto;">
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 30px;text-align:left;">
            <h1 style="color:#111827;font-size:24px;margin:0;">Verify Your Identity 🔐</h1>
            <p style="color:#4b5563;font-size:16px;line-height:1.6;margin-top:15px;">
              Hi <strong>${name}</strong>,<br />
              Use the following One-Time Password (OTP) to complete your verification process.
            </p>

            <!-- OTP Box -->
            <div style="text-align:center;margin:32px 0;">
              <div style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:28px;letter-spacing:6px;padding:16px 32px;border-radius:10px;font-weight:bold;">
                ${otp}
              </div>
            </div>

            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin-top:10px;">
              This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone for your account’s safety.
            </p>

            <div style="text-align:center;margin-top:28px;">
              <a href="${process.env.NEXT_PUBLIC_URL || ""}/verify"
                 style="background-color:#111827;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;display:inline-block;">
                 Verify In App
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:20px;text-align:center;color:#9ca3af;font-size:13px;line-height:1.5;">
            If you didn’t request this, you can safely ignore this email.<br>
            © ${new Date().getFullYear()} EliteCafe. All rights reserved.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
      `,
    });

    return { success: true, message: "OTP email sent successfully.", info };
}
catch(err){
    console.error("Error sending OTP email:", err);
    return { message: "Failed to send OTP email", success: false, error: err }
}
}