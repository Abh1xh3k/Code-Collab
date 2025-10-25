import express from "express";
import { signup, login, logout } from "../controller/authController.js";
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router= express.Router();
router.post('/signup',signup);
router.post('/login',login);
router.post('/logout',logout);
router.get('/google',
    passport.authenticate('google', {scope: ['profile', 'email']})
);

router.get('/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: 'http://localhost:5173/login?error=auth_failed'
    }),
    (req, res) => {
        try {
            console.log('OAuth callback - User:', req.user);
            
            if (!req.user) {
                const isLocalhost = req.get('host').includes('localhost');
                const redirectUrl = isLocalhost 
                    ? 'http://localhost:5173/login?error=no_user'
                    : `${process.env.FRONTEND_URL}/login?error=no_user`;
                return res.redirect(redirectUrl);
            }
            
            // Successful authentication, generate JWT and redirect
            const token = jwt.sign(
                { id: req.user._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
            );
            
            console.log('Generated token for user:', req.user._id);
            
            // Set cookie
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax", // Changed from "strict" to "lax" for OAuth
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
            });
            
            // Dynamic redirect based on environment
            const isLocalhost = req.get('host').includes('localhost') || req.get('host').includes('127.0.0.1');
            const frontendUrl = isLocalhost 
                ? 'http://localhost:5173' 
                : process.env.FRONTEND_URL;
            
            console.log('Redirecting to:', `${frontendUrl}/room`);
            res.redirect(`${frontendUrl}/room`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            const isLocalhost = req.get('host').includes('localhost');
            const redirectUrl = isLocalhost 
                ? 'http://localhost:5173/login?error=server_error'
                : `${process.env.FRONTEND_URL}/login?error=server_error`;
            res.redirect(redirectUrl);
        }
    }
);

router.get('/me', (req, res) => {
    if(req.user){
        res.json({user:req.user});
    }
    else{
        res.status(401).json({message:"Unauthorized"});
    }
});

export default router;