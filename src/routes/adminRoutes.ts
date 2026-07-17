// backend/src/routes/adminRoutes.ts
import { Router } from 'express'
import { protect, authorize } from '../middleware/auth'
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
  getOrders,
  updateOrderStatus,
  cancelOrder
} from '../controllers/adminController'

const router = Router()

router.use(protect, authorize('admin'))

// Dashboard
router.get('/dashboard', getDashboardStats)

// Users
router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.put('/users/:id/role', updateUserRole)
router.put('/users/:id/block', toggleUserBlock)
router.delete('/users/:id', deleteUser)

// Orders
router.get('/orders', getOrders)
router.put('/orders/:id/status', updateOrderStatus)
router.put('/orders/:id/cancel', cancelOrder)

export default router