import nodemailer from 'nodemailer';
const ConnectEmailClient = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST||"",
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL || "", 
        pass: process.env.EMAIL_PASSWORD|| "",
      },
    });
    return transporter;
  } catch (error) {
    console.error("Error connecting to email client:", error);
  }
};

export default ConnectEmailClient;