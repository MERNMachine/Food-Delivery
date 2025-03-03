const express = require('express');
const Favorites = require('../models/favoriteModel');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Add to favorites
router.post('/add', authMiddleware, async (req, res) => {
  const { userId, menuId, title, description, percent, expiredTime } = req.body;
  try {
    const newFavorite = new Favorites({ userId, menuId, title, description, percent, expiredTime });
    await newFavorite.save();
    res.status(200).json({ msg: 'Item added to favorites' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove from favorites
router.post('/remove', authMiddleware, async (req, res) => {
  const { userId, menuId } = req.body;
  try {
    await Favorites.findOneAndDelete({ userId, menuId });
    res.status(200).json({ msg: 'Item removed from favorites' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
