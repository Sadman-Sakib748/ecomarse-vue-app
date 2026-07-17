import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Email options interface
interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Email templates - Type is used internally
interface EmailTemplateData {
  subject: string
  html: string
}

// Email service class
class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"ShopVue" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`📧 Email sent to ${options.to}`)
    } catch (error) {
      console.error('❌ Email sending failed:', error)
      throw new Error('Failed to send email')
    }
  }

  // Template methods
  private getWelcomeTemplate(name: string): EmailTemplateData {
    return {
      subject: 'Welcome to ShopVue! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: #0284c7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to ShopVue!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining ShopVue! We're excited to have you on board.</p>
            <p>Start exploring our collection of premium products and enjoy exclusive offers.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" 
                 style="background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Shopping
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
            <p style="color: #6b7280; font-size: 14px;">- The ShopVue Team</p>
          </div>
        </div>
      `
    }
  }

  private getOrderConfirmationTemplate(name: string, orderNumber: string, items: any[], total: number): EmailTemplateData {
    return {
      subject: `Order Confirmation #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: #0284c7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Order Confirmed! ✅</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2>Hi ${name},</h2>
            <p>Your order <strong>#${orderNumber}</strong> has been confirmed.</p>
            
            <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0;">
                    <strong>${item.name}</strong>
                    <br>
                    <span style="color: #6b7280;">Quantity: ${item.quantity}</span>
                  </td>
                  <td style="padding: 10px 0; text-align: right;">
                    $${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <p><strong>Total: $${total.toFixed(2)}</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderNumber}" 
                 style="background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Order
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Thank you for shopping with ShopVue!</p>
          </div>
        </div>
      `
    }
  }

  private getPasswordResetTemplate(name: string, resetToken: string): EmailTemplateData {
    return {
      subject: 'Password Reset Request 🔑',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: #0284c7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}" 
                 style="background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `
    }
  }

  private getOrderStatusUpdateTemplate(name: string, orderNumber: string, status: string): EmailTemplateData {
    return {
      subject: `Order #${orderNumber} Status Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: #0284c7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Order Status Updated</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2>Hi ${name},</h2>
            <p>Your order <strong>#${orderNumber}</strong> status has been updated to:</p>
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 18px; font-weight: bold; color: #0284c7; text-transform: uppercase;">
                ${status.toUpperCase()}
              </span>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderNumber}" 
                 style="background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Order
              </a>
            </div>
          </div>
        </div>
      `
    }
  }

  // Public email sending methods
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const template = this.getWelcomeTemplate(name)
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    })
  }

  async sendOrderConfirmation(
    email: string,
    name: string,
    orderNumber: string,
    items: any[],
    total: number
  ): Promise<void> {
    const template = this.getOrderConfirmationTemplate(name, orderNumber, items, total)
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    })
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const template = this.getPasswordResetTemplate(name, resetToken)
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    })
  }

  async sendOrderStatusUpdateEmail(
    email: string,
    name: string,
    orderNumber: string,
    status: string
  ): Promise<void> {
    const template = this.getOrderStatusUpdateTemplate(name, orderNumber, status)
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    })
  }

  // Verify email configuration
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('✅ Email service connected')
      return true
    } catch (error) {
      console.error('❌ Email service connection failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()