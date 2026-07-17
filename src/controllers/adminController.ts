import { Request, Response } from 'express'
import { Types } from 'mongoose'
import User from '../models/User'
import Product from '../models/Product'
import Order from '../models/Order'
import { IUser } from '../types'

// Extended Request type with user
interface AuthRequest extends Request {
  user?: IUser
}

// ==================== DASHBOARD ====================

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      recentOrders,
      lowStockProducts
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isPublished: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Product.find({ stock: { $lt: 10 }, isPublished: true })
        .select('name price stock')
        .limit(5)
    ])

    const revenue = totalRevenue[0]?.total || 0

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: revenue,
          pendingOrders
        },
        recentOrders,
        lowStockProducts
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 20, search } = req.query

    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get user orders count
    const orderCount = await Order.countDocuments({ user: user._id })
    const orderTotal = await Order.aggregate([
      { $match: { user: user._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])

    const userObject = user.toObject()
    return res.status(200).json({
      success: true,
      data: {
        ...userObject,
        orderCount,
        totalSpent: orderTotal[0]?.total || 0
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { role } = req.body

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin)'
      })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: `User role updated to ${role}`
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleUserBlock = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { isBlocked } = req.body

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    // Use _id which exists on IUser
    const userId = (req.user._id as Types.ObjectId).toString()
    if (req.params.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block your own account'
      })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: isBlocked ? 'User blocked successfully' : 'User unblocked successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    // Use _id which exists on IUser
    const userId = (req.user._id as Types.ObjectId).toString()
    if (req.params.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await user.deleteOne()
    await Order.deleteMany({ user: user._id })

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// ==================== ORDER MANAGEMENT ====================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 20, status, search } = req.query

    const query: any = {}
    if (status) query.status = status
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { status } = req.body

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Please provide a valid status: ${validStatuses.join(', ')}`
      })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Update order status
    order.status = status as any
    
    if (status === 'delivered') {
      order.isDelivered = true
      order.deliveredAt = new Date()
    }

    // Return stock if cancelled or refunded
    if (status === 'cancelled' || status === 'refunded') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity }
        })
      }
    }

    await order.save()

    return res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Cancel order
// @route   PUT /api/admin/orders/:id/cancel
// @access  Private/Admin
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { reason } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order'
      })
    }

    // Return stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      })
    }

    order.status = 'cancelled'
    order.notes = reason || 'Cancelled by admin'
    await order.save()

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}