// src/services/jwt.service.ts
import jwt from 'jsonwebtoken'

interface TokenPayload {
    id: string
}

export const generateToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET as string
    const expiresIn = process.env.JWT_EXPIRE || '7d'

    return jwt.sign(payload, secret, {
        expiresIn: expiresIn as jwt.SignOptions['expiresIn']
    })
}

export const verifyToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET as string
    return jwt.verify(token, secret) as TokenPayload
}