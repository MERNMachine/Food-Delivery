// Updated auth.js with Google OAuth and JWT
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// JWT Token Generator
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, birthday, password } = req.body;
  // Validate input
  if (!firstName || !lastName || !email  || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ firstName, lastName, email, birthday: birthday ? birthday : null, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser);
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('cart').populate('favorites');
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        favorites: user.favorites,
        cart: user.cart,
      },
    });
  } catch (err) {
    console.error('Error during login:', err); // Log the error details
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.json({ token });
  }
);

module.exports = router;
