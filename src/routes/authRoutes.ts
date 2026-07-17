import { Router } from 'express'
import { register, login, getMe, updateProfile } from '../controllers/authController'
import { protect } from '../middleware/auth'
import { validateRegister, validateLogin, handleValidationErrors } from '../utils/validators'

const router = Router()

router.post('/register', validateRegister, handleValidationErrors, register)
router.post('/login', validateLogin, handleValidationErrors, login)
router.get('/me', protect, getMe)
router.put('/update', protect, updateProfile)

export default router