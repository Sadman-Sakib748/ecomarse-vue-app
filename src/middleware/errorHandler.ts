import { Request, Response, NextFunction } from 'express'

// Custom error interface for better type safety
interface CustomError extends Error {
  statusCode?: number
  code?: number
  keyPattern?: Record<string, any>
  value?: any
  errors?: Record<string, { message: string }>
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400
    const errors = Object.values(err.errors).map((e: any) => e.message)
    message = errors.join(', ')
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000 && err.keyPattern) {
    statusCode = 400
    const field = Object.keys(err.keyPattern)[0]
    message = `Duplicate value for ${field}. Please use another value.`
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404
    message = `Resource not found with id: ${err.value}`
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token. Please log in again.'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired. Please log in again.'
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}