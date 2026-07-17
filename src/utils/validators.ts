import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'

// Register validation
export const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

// Login validation
export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]

// Product validation
export const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isNumeric().withMessage('Stock must be a number')
]

// Order validation
export const validateOrder = [
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
]

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
  next()
}