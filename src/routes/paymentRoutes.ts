// backend/src/routes/paymentRoutes.ts
import { Router } from 'express'
import { protect } from '../middleware/auth'
import {
  createPaymentIntent,
  confirmPayment,
  refundPayment
} from '../controllers/paymentController'

const router = Router()

// ✅ All routes require authentication
router.use(protect)

// ✅ Create Payment Intent - POST /api/payment/create-intent
router.post('/create-intent', createPaymentIntent)

// ✅ Confirm Payment - POST /api/payment/confirm
router.post('/confirm', confirmPayment)

// ✅ Refund Payment - POST /api/payment/refund
router.post('/refund', refundPayment)

export default router