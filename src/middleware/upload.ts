import multer, { Multer } from 'multer'
import path from 'path'
import { Request } from 'express'

// Configure storage
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, 'uploads/')
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter with proper error handling
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    cb(null, true)
  } else {
    // Option 1: Just reject the file without error
    cb(null, false)
    
    // Option 2: Reject with custom error message
    // const error = new Error('Only images are allowed (jpeg, jpg, png, gif, webp)')
    // cb(error as any, false)
  }
}

// Configure upload
const upload: Multer = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: fileFilter
})

export default upload