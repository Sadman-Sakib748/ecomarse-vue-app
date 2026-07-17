import mongoose, { Schema, Model } from 'mongoose'
import slugify from 'slugify'
import { IProduct, IProductImage, IRatings } from '../types'

const productImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  isMain: { type: Boolean, default: false }
})

const ratingsSchema = new Schema<IRatings>({
  average: { type: Number, default: 0, min: 0, max: 5 },
  count: { type: Number, default: 0 }
})

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot be more than 100 characters']
    },
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative']
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
      default: null
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category']
    },
    brand: {
      type: String,
      trim: true
    },
    images: {
      type: [productImageSchema],
      default: []
    },
    thumbnail: {
      type: String,
      required: [true, 'Please provide a thumbnail image']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sold: {
      type: Number,
      default: 0
    },
    ratings: {
      type: ratingsSchema,
      default: { average: 0, count: 0 }
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    tags: {
      type: [String],
      default: []
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Create slug before saving
productSchema.pre<IProduct>('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100)
  }
  return 0
})

// Virtual for inStock status
productSchema.virtual('inStock').get(function () {
  return this.stock > 0
})

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema)
export default Product