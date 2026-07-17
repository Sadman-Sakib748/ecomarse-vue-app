import { Router, Request, Response } from 'express'
import { protect } from '../middleware/auth'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController'

const router = Router()

// All routes require authentication
router.use(protect)

// Get cart
router.get('/', async (_req: Request, res: Response) => {
  await getCart(_req as any, res)
})

// Add to cart
router.post('/', async (req: Request, res: Response) => {
  await addToCart(req, res)
})

// Update cart item
router.put('/:productId', async (req: Request, res: Response) => {
  await updateCartItem(req, res)
})

// Remove from cart
router.delete('/:productId', async (req: Request, res: Response) => {
  await removeFromCart(req, res)
})

// Clear cart
router.delete('/', async (_req: Request, res: Response) => {
  await clearCart(_req as any, res)
})

export default router