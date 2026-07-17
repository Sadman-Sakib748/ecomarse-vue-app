import mongoose, { Schema, Model } from 'mongoose'
import { IOrder, IOrderItem, IShippingAddress, IPaymentResult } from '../types'

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: true
  }
})

const shippingAddressSchema = new Schema<IShippingAddress>({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true }
})

const paymentResultSchema = new Schema<IPaymentResult>({
  id: String,
  status: String,
  updateTime: String,
  emailAddress: String,
  paymentMethod: String
})

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderNumber: {
      type: String,
      // ❌ Remove required: true
      unique: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe', 'cod'],
      required: true
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Shipping price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date,
    notes: String,
    paymentResult: paymentResultSchema
  },
  {
    timestamps: true
  }
)

// ✅ Generate order number before saving
orderSchema.pre<IOrder>('save', function (next) {
  if (!this.orderNumber) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    this.orderNumber = `SV-${year}${month}${day}-${random}`
  }
  next()
})

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema)
export default Order