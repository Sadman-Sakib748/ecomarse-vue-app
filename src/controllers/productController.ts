// backend/src/controllers/productController.ts
import { Request, Response } from 'express'
import { Types } from 'mongoose'
import Product from '../models/Product'
import Order from '../models/Order'
import Cart from '../models/Cart'
import cloudinary from '../config/cloudinary'
import { stripeService } from '../services/stripe.service'
import { IUser } from '../types'

interface ProductQuery {
  isPublished: boolean
  category?: any
  $text?: any
  isFeatured?: boolean
  price?: any
  'ratings.average'?: any
  stock?: any
}

interface AuthRequest extends Request {
  user?: IUser
}

export const getProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      featured,
      rating,
      inStock
    } = req.query

    const query: ProductQuery = { isPublished: true }

    if (category && category !== 'all') {
      query.category = category
    }

    if (search) {
      query.$text = { $search: search as string }
    }

    if (featured === 'true') {
      query.isFeatured = true
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) }
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 }
    }

    let sortOption: any = {}
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }
      break
      case 'price-high': sortOption = { price: -1 }
      break
      case 'rating': sortOption = { 'ratings.average': -1 }
      break
      case 'newest': sortOption = { createdAt: -1 }
      break
      default: sortOption = { isFeatured: -1, createdAt: -1 }
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: products,
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

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const products = await Product.find({
      isPublished: true,
      isFeatured: true
    })
      .populate('category', 'name slug')
      .sort({ 'ratings.average': -1 })
      .limit(8)
      .lean()

    return res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const getProductBySlug = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isPublished: true })
      .populate('category', 'name slug')
      .lean()

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } })

    return res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const createProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await Product.create(req.body)
    return res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    return res.status(200).json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    await product.deleteOne()
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const uploadImages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      })
    }

    const images = []
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce/products',
        width: 800,
        height: 800,
        crop: 'fill'
      })

      images.push({
        url: result.secure_url,
        publicId: result.public_id,
        isMain: images.length === 0
      })
    }

    product.images.push(...images)
    if (!product.thumbnail && images.length > 0) {
      product.thumbnail = images[0].url
    }
    await product.save()

    return res.status(200).json({
      success: true,
      data: product.images
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const purchaseProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { quantity = 1 } = req.body
    const productId = req.params.id

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    if (!product.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      })
    }

    const totalPrice = product.price * quantity
    const taxPrice = totalPrice * 0.1
    const shippingPrice = totalPrice > 100 ? 0 : 9.99

    const order = await Order.create({
      user: new Types.ObjectId(req.user._id),
      orderItems: [{
        product: new Types.ObjectId(product._id),
        name: product.name,
        quantity: quantity,
        price: product.price,
        image: product.thumbnail
      }],
      shippingAddress: {
        fullName: req.user.name || '',
        address: req.user.address?.street || '',
        city: req.user.address?.city || '',
        state: req.user.address?.state || '',
        zipCode: req.user.address?.zipCode || '',
        country: req.user.address?.country || '',
        phone: req.user.phone || '',
        email: req.user.email || ''
      },
      paymentMethod: 'stripe',
      taxPrice,
      shippingPrice,
      totalPrice: totalPrice + taxPrice + shippingPrice,
      notes: 'Direct purchase (Buy Now)'
    })

    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity, sold: quantity }
    })

    const paymentIntent = await stripeService.createPaymentIntent(
      order.totalPrice,
      'usd',
      {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: req.user._id.toString()
      }
    )

    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      updateTime: new Date().toISOString()
    }
    await order.save()

    await order.populate('orderItems.product', 'name price images')

    return res.status(201).json({
      success: true,
      data: {
        order,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    })
  } catch (error) {
    console.error('❌ Purchase error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export const addProductToCart = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { quantity = 1 } = req.body
    const productId = req.params.id

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    if (!product.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      })
    }

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({
        user: new Types.ObjectId(req.user._id),
        items: [{ 
          product: new Types.ObjectId(productId),
          quantity: quantity 
        }]
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
        cart.items.push({ 
          product: new Types.ObjectId(productId),
          quantity: quantity 
        })
      }
      await cart.save()
    }

    await cart.populate('items.product', 'name price images thumbnail stock')

    return res.status(200).json({
      success: true,
      data: cart,
      message: 'Product added to cart'
    })
  } catch (error) {
    console.error('❌ Add to cart error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}