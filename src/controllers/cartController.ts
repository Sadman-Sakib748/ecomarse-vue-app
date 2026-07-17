import { Request, Response } from 'express'
import Cart from '../models/Cart'
import Product from '../models/Product'

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id })
      .populate('items.product', 'name price images thumbnail stock')

    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] })
    }

    return res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { productId, quantity = 1 } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      })
    }

    let cart = await Cart.findOne({ user: req.user?._id })

    if (!cart) {
      cart = await Cart.create({
        user: req.user?._id,
        items: [{ product: productId, quantity }]
      })
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      )

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available in stock`
          })
        }
        existingItem.quantity = newQuantity
      } else {
        cart.items.push({ product: productId, quantity })
      }

      await cart.save()
    }

    await cart.populate('items.product', 'name price images thumbnail stock')

    return res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { productId } = req.params
    const { quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      })
    }

    const cart = await Cart.findOne({ user: req.user?._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      })
    }

    const item = cart.items.find((item) => item.product.toString() === productId)
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      })
    }

    item.quantity = quantity
    await cart.save()
    await cart.populate('items.product', 'name price images thumbnail stock')

    return res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user?._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      })
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    )

    await cart.save()
    await cart.populate('items.product', 'name price images thumbnail stock')

    return res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      })
    }

    cart.items = []
    await cart.save()

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}