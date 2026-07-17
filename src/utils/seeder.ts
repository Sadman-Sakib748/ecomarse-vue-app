import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User'
import connectDB from '../config/database'

dotenv.config()

const adminUser = {
    name: 'test admin',
    email: 'test@admin.com',
    password: 'Test@123456',
    role: 'admin',
    isBlocked: false,
}

const seedAdmin = async () => {
    try {
        await connectDB()

        // Delete existing admin using mongoose
        await User.deleteOne({ email: adminUser.email })
        console.log('🗑️ Existing admin deleted')

        // 🔐 Generate hash using sync methods
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(adminUser.password, salt)

        console.log('🔐 Password hashed successfully!')
        console.log('📝 Hash:', hashedPassword)

        // 🔥 Create using mongoose with raw password (pre-save will hash)
        // BUT we already hashed, so use create with hashed password
        const admin = await User.create({
            name: adminUser.name,
            email: adminUser.email,
            password: hashedPassword, // Already hashed
            role: adminUser.role,
            isBlocked: adminUser.isBlocked,
        })

        console.log('\n✅ Admin created successfully!')
        console.log('========================================')
        console.log('📧 Email:', admin.email)
        console.log('🔑 Password:', adminUser.password)
        console.log('👑 Role:', admin.role)
        console.log('🆔 User ID:', admin._id)
        console.log('========================================')

        // 🔐 VERIFY: Check if password works
        const isMatch = await admin.comparePassword(adminUser.password)
        
        if (isMatch) {
            console.log('\n✅ PASSWORD VERIFICATION: SUCCESS 🎉')
        } else {
            console.log('\n❌ PASSWORD VERIFICATION: FAILED')
            console.log('⚠️  Trying direct compare...')
            
            const directMatch = bcrypt.compareSync(adminUser.password, admin.password)
            console.log('📊 Direct compare:', directMatch)
        }

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding admin:', error)
        process.exit(1)
    }
}

seedAdmin()