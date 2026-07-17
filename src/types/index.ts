import { Document, Types } from 'mongoose'

// ==================== USER TYPES ====================

export interface IAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  avatar?: string
  address?: IAddress | null
  phone?: string | null
  wishlist: Types.ObjectId[]
  isBlocked: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

// ==================== PRODUCT TYPES ====================

export interface IProductImage {
  url: string
  publicId: string
  isMain: boolean
}

export interface IRatings {
  average: number
  count: number
}

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number | null
  category: Types.ObjectId
  brand?: string
  images: IProductImage[]
  thumbnail: string
  stock: number
  sold: number
  ratings: IRatings
  isFeatured: boolean
  isPublished: boolean
  tags: string[]
  views: number
  discountPercentage?: number
  inStock?: boolean
}

// ==================== CATEGORY TYPES ====================

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  sortOrder: number
}

// ==================== ORDER TYPES ====================

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  quantity: number
  price: number
  image: string
}

export interface IShippingAddress {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
}

export interface IPaymentResult {
  id: string
  status: string
  updateTime: string
  emailAddress?: string
  paymentMethod?: string
}

export interface IOrder extends Document {
  user: Types.ObjectId
  orderNumber: string
  orderItems: IOrderItem[]
  shippingAddress: IShippingAddress
  paymentMethod: 'credit_card' | 'paypal' | 'stripe' | 'cod'
  taxPrice: number
  shippingPrice: number
  totalPrice: number
  discount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  isPaid: boolean
  paidAt?: Date
  isDelivered: boolean
  deliveredAt?: Date
  notes?: string
  paymentResult?: IPaymentResult
}

// ==================== CART TYPES ====================

export interface ICartItem {
  product: Types.ObjectId
  quantity: number
}

export interface ICart extends Document {
  user: Types.ObjectId
  items: ICartItem[]
}

// ==================== REVIEW TYPES ====================

export interface IReview extends Document {
  user: Types.ObjectId
  product: Types.ObjectId
  rating: number
  title?: string
  comment?: string
  isApproved: boolean
}

// ==================== API RESPONSE TYPES ====================

export interface IApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface IPagination {
  page: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: IPagination
}

// ==================== REQUEST TYPES ====================

export interface IRegisterRequest {
  name: string
  email: string
  password: string
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface IAuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// ==================== PAYMENT TYPES ====================

export interface IPaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled'
}

export interface IRefund {
  id: string
  amount: number
  status: string
  reason?: string
}

// ==================== WISHLIST TYPES ====================

export interface IWishlistItem {
  product: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
}

// ==================== COUPON TYPES ====================

export interface ICoupon extends Document {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minOrder?: number
  maxDiscount?: number
  expiresAt: Date
  isActive: boolean
}

// ==================== NOTIFICATION TYPES ====================

export interface INotification extends Document {
  user: Types.ObjectId
  title: string
  message: string
  type: 'order' | 'promotion' | 'system' | 'payment'
  isRead: boolean
  data?: Record<string, any>
}

// ==================== Express Request Extension ====================

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

// ==================== EXPORT ALL TYPES ====================



// ==================== USER TYPES ====================

export interface IAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  avatar?: string
  address?: IAddress | null
  phone?: string | null
  wishlist: Types.ObjectId[]
  isBlocked: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

// ==================== PRODUCT TYPES ====================

export interface IProductImage {
  url: string
  publicId: string
  isMain: boolean
}

export interface IRatings {
  average: number
  count: number
}

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number | null
  category: Types.ObjectId
  brand?: string
  images: IProductImage[]
  thumbnail: string
  stock: number
  sold: number
  ratings: IRatings
  isFeatured: boolean
  isPublished: boolean
  tags: string[]
  views: number
  discountPercentage?: number
  inStock?: boolean
}

// ==================== CATEGORY TYPES ====================

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  sortOrder: number
}

// ==================== ORDER TYPES ====================

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  quantity: number
  price: number
  image: string
}

export interface IShippingAddress {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
}

export interface IPaymentResult {
  id: string
  status: string
  updateTime: string
  emailAddress?: string
  paymentMethod?: string
}

export interface IOrder extends Document {
  user: Types.ObjectId
  orderNumber: string
  orderItems: IOrderItem[]
  shippingAddress: IShippingAddress
  paymentMethod: 'credit_card' | 'paypal' | 'stripe' | 'cod'
  taxPrice: number
  shippingPrice: number
  totalPrice: number
  discount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  isPaid: boolean
  paidAt?: Date
  isDelivered: boolean
  deliveredAt?: Date
  notes?: string
  paymentResult?: IPaymentResult
   createdAt: Date  
  updatedAt: Date
}

// ==================== CART TYPES ====================

export interface ICartItem {
  product: Types.ObjectId
  quantity: number
}

export interface ICart extends Document {
  user: Types.ObjectId
  items: ICartItem[]
}

// ==================== REVIEW TYPES ====================

export interface IReview extends Document {
  user: Types.ObjectId
  product: Types.ObjectId
  rating: number
  title?: string
  comment?: string
  isApproved: boolean
}

// ==================== API RESPONSE TYPES ====================

export interface IApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface IPagination {
  page: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: IPagination
}

// ==================== REQUEST TYPES ====================

export interface IRegisterRequest {
  name: string
  email: string
  password: string
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface IAuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// ==================== PAYMENT TYPES ====================

export interface IPaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled'
}

export interface IRefund {
  id: string
  amount: number
  status: string
  reason?: string
}

// ==================== WISHLIST TYPES ====================

export interface IWishlistItem {
  product: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
}

// ==================== COUPON TYPES ====================

export interface ICoupon extends Document {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minOrder?: number
  maxDiscount?: number
  expiresAt: Date
  isActive: boolean
}

// ==================== NOTIFICATION TYPES ====================

export interface INotification extends Document {
  user: Types.ObjectId
  title: string
  message: string
  type: 'order' | 'promotion' | 'system' | 'payment'
  isRead: boolean
  data?: Record<string, any>
}

// ==================== Express Request Extension ====================

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

