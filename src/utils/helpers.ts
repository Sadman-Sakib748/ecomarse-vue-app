import { Response } from 'express'

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  data?: T,
  message?: string
): Response => {
  return res.status(statusCode).json({
    success,
    ...(data && { data }),
    ...(message && { message })
  })
}

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const calculateDiscount = (price: number, comparePrice: number): number => {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    refunded: 'badge-secondary'
  }
  return colors[status] || 'badge-secondary'
}