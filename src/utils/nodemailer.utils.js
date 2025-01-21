import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const mailsend = async (to, subject, html) => {

    const transporter = nodemailer.createTransport({
        service: 'Zoho Mail',
        port: process.env.SMTP_PORT,               // true for 465, false for other ports
        host: process.env.SMTP_HOST,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: html
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        return result.messageId;
    } catch (error) {
        return error;
    }

};

export default mailsend;