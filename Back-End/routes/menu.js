const express = require('express');
const Menu = require('../models/menuModel');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get Menu List with Filters
router.get('/', async (req, res) => {
  try {
    const { query, subCategory } = req.query;
    const filter = {};

    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
      ];
    }

    if (subCategory) {
      const subCategories = Array.isArray(subCategory) ? subCategory : [subCategory];
      if (subCategories.length > 0) {
        filter.category_id = { $in: subCategories }; // Use category_id to match subCategory
      }
    }

    const menus = await Menu.find(filter).populate('feedbacks').populate('translations');
    const menuList = menus.map(menu => {
      const totalRatings = menu.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
      const stars = menu.feedbacks.length ? totalRatings / menu.feedbacks.length : 0;
      return {
        ...menu.toObject(),
        stars,
        likeCount: menu.likes.length,
        dislikeCount: menu.dislikes.length,
      };
    });

    res.json(menuList);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get Menu Item by ID
router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)
    .populate({
            path: "feedbacks.user_id",
            select: "firstName",
    })
    .populate('translations');
    if (!menu) return res.status(404).json({ msg: 'Menu item not found' });

    const totalRatings = menu.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    const stars = menu.feedbacks.length ? totalRatings / menu.feedbacks.length : 0;

    const menuItem = {
      ...menu.toObject(),
      stars,
      likeCount: menu.likes.length,
      dislikeCount: menu.dislikes.length,
    };

    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add Feedback to Menu Item
router.post('/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ msg: 'Menu item not found' });
    const existingFeedback = menu.feedbacks.find(feedback => feedback.user_id.toString() === req.user._id.toString());
    if (existingFeedback) return res.status(400).json({ msg: 'User has already provided feedback' });

    menu.feedbacks.push({ user_id: req.user._id, rating, comments });
    await menu.save();

    res.status(201).json(menu);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Remove Feedback from Menu Item
router.delete('/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ msg: 'Menu item not found' });

    const feedbackIndex = menu.feedbacks.findIndex(feedback => feedback.user_id.toString() === req.user._id.toString());
    if (feedbackIndex === -1) return res.status(404).json({ msg: 'Feedback not found' });

    menu.feedbacks.splice(feedbackIndex, 1);
    await menu.save();

    res.json(menu);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Like a Menu Item
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ msg: 'Menu item not found' });

    if (menu.likes.includes(req.user._id)) {
      return res.status(400).json({ msg: 'User has already liked this menu item' });
    }

    menu.likes.push(req.user._id);
    menu.dislikes = menu.dislikes.filter(userId => userId.toString() !== req.user._id.toString());
    await menu.save();

    res.json(menu);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Dislike a Menu Item
router.post('/:id/dislike', authMiddleware, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ msg: 'Menu item not found' });

    if (menu.dislikes.includes(req.user._id)) {
      return res.status(400).json({ msg: 'User has already disliked this menu item' });
    }

    menu.dislikes.push(req.user._id);
    menu.likes = menu.likes.filter(userId => userId.toString() !== req.user._id.toString());
    await menu.save();

    res.json(menu);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
