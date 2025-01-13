import nodemailer from 'nodemailer';


const mailsend = async (to, subject, html) => {

    const transporter = nodemailer.createTransport({
        service: 'Zoho Mail',
        port: 465,               // true for 465, false for other ports
        host: "***********",
        secure: true, // true for 465, false for other ports
        auth: {
            user: "************",
            pass: "*************"
        }
    });

    const mailOptions = {
        from: '**************',
        to: to,
        subject: subject,
        html: html
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        return error;
    }

};

export default mailsend;