const express = require('express');
const Cart = require('../models/cartModel');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  const { menuId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (cart) {
      // Update existing cart
      const itemIndex = cart.items.findIndex(item => item.menuId.toString() === menuId);
      if (itemIndex !== -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ menuId, quantity });
      }
      await cart.save();
    } else {
      // Create new cart
      const newCart = new Cart({ userId: req.userId, items: [{ menuId, quantity }] });
      await newCart.save();
    }
    res.status(200).json({ msg: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Edit cart item
router.post('/edit', authMiddleware, async (req, res) => {
  const { menuId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    const itemIndex = cart.items.findIndex(item => item.menuId.toString() === menuId);
    if (itemIndex !== -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ msg: 'Cart updated' });
    } else {
      res.status(400).json({ msg: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove item from cart
router.post('/remove', authMiddleware, async (req, res) => {
  const { menuId } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    cart.items = cart.items.filter(item => item.menuId.toString() !== menuId);
    await cart.save();
    res.status(200).json({ msg: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
