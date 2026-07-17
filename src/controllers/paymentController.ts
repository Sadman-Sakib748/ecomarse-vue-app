// backend/src/controllers/paymentController.ts
import { Request, Response } from 'express'
import Stripe from 'stripe'
import Order from '../models/Order'
import { IPaymentResult } from '../types'

// ✅ Fix: Use correct API version or skip it
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any, // Use 'as any' to bypass TypeScript version check
})

export const createPaymentIntent = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('💳 Creating payment intent...')
    console.log('📝 Request body:', req.body)
    console.log('👤 User:', req.user?._id)

    const { orderId } = req.body

    // ✅ Check if orderId exists
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      })
    }

    // ✅ Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    // ✅ Find order
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    console.log('✅ Order found:', order.orderNumber)
    console.log('💰 Total:', order.totalPrice)

    // ✅ Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      })
    }

    // ✅ Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      })
    }

    // ✅ Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: req.user._id.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('✅ Payment intent created:', paymentIntent.id)
    console.log('🔑 Client Secret:', paymentIntent.client_secret?.substring(0, 20) + '...')

    // ✅ Fix: Ensure all required fields are present
    const paymentResult: IPaymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      updateTime: new Date().toISOString(),
    }
    order.paymentResult = paymentResult
    await order.save()

    return res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    })
  } catch (error: any) {
    console.error('❌ Payment intent error:', error)
    console.error('❌ Error details:', error.message)
    
    // ✅ Handle Stripe specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid Stripe request'
      })
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

export const confirmPayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { paymentIntentId } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    const order = await Order.findOne({
      'paymentResult.id': paymentIntent.id
    })

    if (order) {
      order.isPaid = true
      order.paidAt = new Date()
      order.status = 'processing'
      
      // ✅ Fix: Ensure all required fields are present
      const paymentResult: IPaymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date().toISOString(),
      }
      order.paymentResult = paymentResult
      await order.save()
    }

    return res.status(200).json({
      success: true,
      data: {
        status: paymentIntent.status,
        orderId: order?._id
      }
    })
  } catch (error: any) {
    console.error('❌ Confirm payment error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

export const refundPayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { paymentIntentId, amount, reason } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      })
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any
    })

    const order = await Order.findOne({
      'paymentResult.id': paymentIntentId
    })

    if (order) {
      order.status = 'refunded'
      
      // ✅ Fix: Ensure all required fields are present
      const paymentResult: IPaymentResult = {
        id: order.paymentResult?.id || paymentIntentId,
        status: 'refunded',
        updateTime: new Date().toISOString(),
        paymentMethod: order.paymentResult?.paymentMethod || 'card'
      }
      order.paymentResult = paymentResult
      await order.save()
    }

    return res.status(200).json({
      success: true,
      data: refund,
      message: 'Refund processed successfully'
    })
  } catch (error: any) {
    console.error('❌ Refund error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}