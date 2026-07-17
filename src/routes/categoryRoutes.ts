import { Router } from 'express'
import { protect, authorize } from '../middleware/auth'
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController'

const router = Router()

// Public routes
router.get('/', getCategories)
router.get('/:id', getCategoryById)

// Admin routes
router.post('/', protect, authorize('admin'), createCategory)
router.put('/:id', protect, authorize('admin'), updateCategory)
router.delete('/:id', protect, authorize('admin'), deleteCategory)

export default router