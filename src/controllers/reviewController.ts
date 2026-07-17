import { Request, Response } from 'express'
import Review from '../models/Review'
import Product from '../models/Product'

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { productId, rating, title, comment } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      user: req.user?._id,
      product: productId
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      })
    }

    const review = await Review.create({
      user: req.user?._id,
      product: productId,
      rating,
      title,
      comment
    })

    // Update product ratings
    const allReviews = await Review.find({ product: productId, isApproved: true })
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
    product.ratings.average = allReviews.length > 0 ? totalRating / allReviews.length : 0
    product.ratings.count = allReviews.length
    await product.save()

    return res.status(201).json({
      success: true,
      data: review
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}