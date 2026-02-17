
import nodemailer from "nodemailer";

export async function POST(request: Request) {

  const { email, subject, message } = await request.json();

  const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST as string,
            port: process.env.SMTP_PORT as unknown as number,
            secure: true,
            auth: {
                user: process.env.SMTP_USERNAME as string,
                pass: process.env.SMTP_PASSWORD as string
            },
            tls: {
                rejectUnauthorized: false
            }
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    return Response.json({ message: "Email sent successfully" });
  } catch (error) {
    return Response.json({ message: "Error sending email", error });
  }
}
