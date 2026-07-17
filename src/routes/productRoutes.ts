// backend/src/routes/productRoutes.ts
import { Router } from 'express'
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  purchaseProduct,
  addProductToCart
} from '../controllers/productController'
import { protect, authorize } from '../middleware/auth'
import upload from '../middleware/upload'

const router = Router()

// ==================== PUBLIC ROUTES ====================
router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/slug/:slug', getProductBySlug)

// ==================== PROTECTED ROUTES ====================
router.post('/:id/purchase', protect, purchaseProduct)        // ✅ Buy Now
router.post('/:id/add-to-cart', protect, addProductToCart)    // ✅ Add to Cart

// ==================== ADMIN ROUTES ====================
router.post('/', protect, authorize('admin'), createProduct)
router.put('/:id', protect, authorize('admin'), updateProduct)
router.delete('/:id', protect, authorize('admin'), deleteProduct)
router.post('/:id/images', protect, authorize('admin'), upload.array('images', 5), uploadImages)

export default router