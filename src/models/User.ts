import mongoose, { Schema, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { IUser, IAddress } from '../types'

const addressSchema = new Schema<IAddress>({
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true }
})

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        avatar: {
            type: String,
            default: ''
        },
        address: {
            type: addressSchema,
            default: null
        },
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[\d\s-]+$/, 'Please provide a valid phone number'],
            default: null
        },
        wishlist: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: 'Product'
            }],
            default: []
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

// 🔥 FIXED: Only hash if password is modified and NOT already hashed
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    
    // 🔥 Skip if already hashed (starts with $2a$ or $2b$)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return next()
    }
    
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// 🔥 FIXED: Compare password method with debug
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    console.log('🔐 Comparing passwords...')
    console.log('📝 Candidate password length:', candidatePassword.length)
    console.log('🔑 Stored hash:', this.password?.substring(0, 20) + '...')
    
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password)
        console.log('📊 Result:', isMatch)
        return isMatch
    } catch (error) {
        console.error('❌ Compare error:', error)
        return false
    }
}

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema)
export default User