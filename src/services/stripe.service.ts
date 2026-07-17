// backend/src/services/stripe.service.ts
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

class StripeService {
  private stripe: Stripe

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in .env')
    }

    // ✅ Fix: Use 'as any' to bypass version check
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    })
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true }
    })
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.confirm(paymentIntentId)
  }

  async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any
    })
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId)
  }

  async verifyConnection() {
    try {
      await this.stripe.balance.retrieve()
      console.log('✅ Stripe connected successfully')
      return true
    } catch (error) {
      console.error('❌ Stripe connection failed:', error)
      return false
    }
  }
}

export const stripeService = new StripeService()