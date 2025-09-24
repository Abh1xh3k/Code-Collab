import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { updateProfile } from '../controller/userController.js'; // make sure this matches

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      profile: user.profile,
      roles: user.roles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/profile', auth, updateProfile);

export default router;
