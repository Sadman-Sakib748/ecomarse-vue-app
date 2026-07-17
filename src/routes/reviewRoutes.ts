import { Router } from 'express'
import { addReview, getProductReviews } from '../controllers/reviewController'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/product/:productId', getProductReviews)
router.post('/', protect, addReview)

export default router