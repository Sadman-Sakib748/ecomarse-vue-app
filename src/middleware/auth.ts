import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { IUser } from '../types'

interface JwtPayload {
  id: string
  iat: number
  exp: number
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  let token: string | undefined

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    const user: IUser | null = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      })
    }

    req.user = user as IUser
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const user = req.user as IUser
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${user.role} is not authorized to access this route`
      })
    }
    next()
  }
}