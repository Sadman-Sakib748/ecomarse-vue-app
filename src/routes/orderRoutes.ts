// backend/src/routes/orderRoutes.ts
import { Router } from 'express'

import { protect, authorize } from '../middleware/auth'
import { createOrder, getOrderById, getUserOrders } from '../controllers/orderController'
import { cancelOrder, updateOrderStatus } from '../controllers/adminController'

const router = Router()

// ==================== USER ROUTES (Requires Auth) ====================
router.use(protect)

// ✅ Create order - POST /api/orders/create
router.post('/create', createOrder)

// ✅ Get user orders - GET /api/orders/my-orders
router.get('/my-orders', getUserOrders)

// ✅ Get order by ID - GET /api/orders/details/:id
router.get('/details/:id', getOrderById)

// ==================== ADMIN ROUTES (Requires Auth + Admin) ====================
// ✅ Get all orders - GET /api/orders/admin/all-orders
// router.get('/admin/all-orders', authorize('admin'), getAllOrders)

// ✅ Update order status - PUT /api/orders/admin/update-status/:id
router.put('/admin/update-status/:id', authorize('admin'), updateOrderStatus)

// ✅ Cancel order - PUT /api/orders/admin/cancel-order/:id
router.put('/admin/cancel-order/:id', authorize('admin'), cancelOrder)

export default router