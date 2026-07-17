// backend/src/controllers/orderController.ts
import { Request, Response } from 'express'
import { Types } from 'mongoose'
import Order from '../models/Order'
import Product from '../models/Product'
import Cart from '../models/Cart'
import { IOrderItem, IUser } from '../types'

interface AuthRequest extends Request {
  user?: IUser
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    console.log('📦 Creating order...')
    console.log('👤 User:', req.user?._id)
    console.log('📝 Request body:', req.body)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    const { shippingAddress, paymentMethod, items, notes } = req.body

    let orderItems = items
    if (!orderItems || orderItems.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id })
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        })
      }
      orderItems = cart.items
    }

    let totalPrice = 0
    const itemsWithDetails: IOrderItem[] = []

    for (const item of orderItems) {
      const productId = item.product_id || item.product
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required for each item'
        })
      }

      const product = await Product.findById(productId)
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`
        })
      }

      const quantity = item.quantity || 1
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        })
      }

      itemsWithDetails.push({
        product: product._id,
        name: product.name,
        quantity: quantity,
        price: product.price,
        image: product.thumbnail
      })

      totalPrice += product.price * quantity

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -quantity, sold: quantity }
      })
    }

    const taxPrice = totalPrice * 0.1
    const shippingPrice = totalPrice > 100 ? 0 : 9.99
    const finalTotal = totalPrice + taxPrice + shippingPrice

    const order = await Order.create({
      user: new Types.ObjectId(req.user._id),
      orderItems: itemsWithDetails,
      shippingAddress: {
        fullName: shippingAddress.full_name || shippingAddress.fullName || '',
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zip_code || shippingAddress.zipCode || '',
        country: shippingAddress.country || '',
        phone: shippingAddress.phone || '',
        email: req.user.email || ''
      },
      paymentMethod: paymentMethod || 'stripe',
      taxPrice,
      shippingPrice,
      totalPrice: finalTotal,
      notes: notes || ''
    })

    if (!items) {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      )
    }

    await order.populate('orderItems.product', 'name price images')

    console.log('✅ Order created:', order.orderNumber)
    console.log('🆔 Order ID:', order._id)
    console.log('💰 Total:', order.totalPrice)

    // ✅ Return proper response with id
    return res.status(201).json({
      success: true,
      data: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt || new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Create order error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price images')
      .sort({ createdAt: -1 })

    console.log(`📋 Found ${orders.length} orders`)

    return res.status(200).json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('❌ Get user orders error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const getOrderById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'name price images')
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    const orderUserId = order.user._id.toString()
    const currentUserId = req.user._id.toString()
    
    if (orderUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      })
    }

    return res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('❌ Get order error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}