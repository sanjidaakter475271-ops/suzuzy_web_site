import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

/**
 * Send an email
 */
export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    const from = process.env.EMAIL_FROM || '"Royal Suzuki" <noreply@royalsuzuki.com>';

    try {
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}
