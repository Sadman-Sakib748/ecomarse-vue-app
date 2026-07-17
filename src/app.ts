import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import path from 'path'

import connectDB from './config/database'
import { errorHandler } from './middleware/errorHandler'

// ✅ Import all routes
import authRoutes from './routes/authRoutes'
import productRoutes from './routes/productRoutes'
import cartRoutes from './routes/cartRoutes'
import orderRoutes from './routes/orderRoutes'  // ← এই line থাকতে হবে
import reviewRoutes from './routes/reviewRoutes'
import adminRoutes from './routes/adminRoutes'
import categoryRoutes from './routes/categoryRoutes'
import paymentRoutes from './routes/paymentRoutes'

dotenv.config()
connectDB()

const app: Express = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(compression())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ✅ Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)  // ← এই line থাকতে হবে
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/payment', paymentRoutes)

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 API: http://localhost:${PORT}/api/health`)
  console.log(`📦 Order routes: http://localhost:${PORT}/api/orders`)
})

export default app