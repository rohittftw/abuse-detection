import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { getJwtSecret, JWT_EXPIRES_IN } from '../config/auth';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

const signToken = (user: { _id: unknown; email: string }): string =>
  jwt.sign(
    { sub: String(user._id), email: user.email },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );

const publicUser = (user: {
  _id: unknown;
  name: string;
  email: string;
}) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2 || name.length > 80) {
      return res
        .status(400)
        .json({ error: 'Name must be between 2 and 80 characters' });
    }

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    if (password.length > 128) {
      return res
        .status(400)
        .json({ error: 'Password must be 128 characters or fewer' });
    }

    const existing = await User.findOne({ email }).select('_id').lean().exec();
    if (existing) {
      return res
        .status(409)
        .json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    return res.status(201).json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ error: 'An account with this email already exists' });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Could not create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email })
      .select('+passwordHash')
      .exec();

    // Same message for unknown email and wrong password.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Could not sign in' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
