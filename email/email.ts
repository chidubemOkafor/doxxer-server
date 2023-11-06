import nodemailer from 'nodemailer'

export const sendEmail = (recipient: String,subject: String,content: String) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'doxxer.xyz@gmail.com',
            pass: Bun.env.EMAIL_PASSWORD
        }
    })

    const mailOptions: Object = {
        from: 'doxxer.xyz@gmail.com',
        to: recipient,
        subject: subject,
        text: content
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log('Error sending email: ', error)
        } else {
            console.log('Email sent: ', info.response)
        }
    })
}