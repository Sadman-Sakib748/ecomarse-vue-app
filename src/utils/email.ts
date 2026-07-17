import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

interface EmailOptions {
  email: string
  subject: string
  message?: string
  html?: string
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  // Email options
  const mailOptions = {
    from: `"ShopVue" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message
  }

  // Send email
  await transporter.sendMail(mailOptions)
}

export default sendEmail