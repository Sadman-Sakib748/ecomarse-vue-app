import { PassportStatic } from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import User from '../models/User'

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string
}

export default (passport: PassportStatic): void => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id)
        if (user) {
          return done(null, user)
        }
        return done(null, false)
      } catch (error) {
        return done(error, false)
      }
    })
  )
}