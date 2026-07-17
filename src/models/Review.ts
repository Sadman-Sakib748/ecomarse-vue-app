import mongoose, { Schema, Model } from 'mongoose'
import { IReview } from '../types'

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema)
export default Review