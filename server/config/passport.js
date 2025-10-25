import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.provider = 'google';
            user.avatar = profile.photos[0].value;
            await user.save();
            return done(null, user);
        }
        
        // Create new user with shortened username
        const baseUsername = profile.displayName.replace(/\s+/g, '').toLowerCase();
        const shortUsername = baseUsername.length > 6 
            ? baseUsername.substring(0, 6) 
            : baseUsername;
        const finalUsername = shortUsername + Math.floor(Math.random() * 1000);
        
        user = new User({
            googleId: profile.id,
            username: finalUsername.substring(0, 10), // Ensure max 10 characters
            email: profile.emails[0].value,
            provider: 'google',
            avatar: profile.photos[0].value
        });
        
        await user.save();
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;