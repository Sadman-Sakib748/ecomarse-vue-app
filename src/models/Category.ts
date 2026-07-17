import mongoose, { Schema, Model } from 'mongoose'
import slugify from 'slugify'
import { ICategory } from '../types'

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      unique: true,
      maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters']
    },
    image: String,
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

categorySchema.pre<ICategory>('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true })
  next()
})

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema)
export default Category