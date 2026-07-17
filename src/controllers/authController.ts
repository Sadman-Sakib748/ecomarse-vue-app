import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { IRegisterRequest, ILoginRequest, IAuthResponse } from '../types'

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET as string
  const expiresIn = process.env.JWT_EXPIRE || '7d'
  
  return jwt.sign(
    { id }, 
    secret, 
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  )
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request<{}, {}, IRegisterRequest>, 
  res: Response
): Promise<Response> => {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    })

    const token = generateToken(user._id as string)

    const response: IAuthResponse = {
      token,
      user: {
        id: user._id as string,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }

    return res.status(201).json({
      success: true,
      ...response
    })
  } catch (error) {
    console.error('❌ Register error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request<{}, {}, ILoginRequest>, 
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Log untuk debugging
    console.log('🔐 Login attempt:', { email })

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      console.log('❌ User not found:', email)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    console.log('✅ User found:', { email: user.email, role: user.role })

    const isPasswordMatch = await user.comparePassword(password)
    console.log('🔐 Password match:', isPasswordMatch)

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const token = generateToken(user._id as string)

    const response: IAuthResponse = {
      token,
      user: {
        id: user._id as string,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }

    return res.status(200).json({
      success: true,
      ...response
    })
  } catch (error) {
    console.error('❌ Login error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('❌ GetMe error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

// @desc    Update profile
// @route   PUT /api/auth/update
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    const { name, phone, address } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (name) user.name = name
    if (phone) user.phone = phone
    if (address) user.address = address

    await user.save()

    return res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('❌ UpdateProfile error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}