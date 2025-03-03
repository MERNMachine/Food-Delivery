const express = require("express");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

//Save Order
router.post("/create-order", authMiddleware, async (req, res) => {
  // req.user._id
  const { totalPrice, orderItems } = req.body;
  try {
    const newOrder = new Order({
      user_id: req.user._id,
      order_items: orderItems,
      total_price: totalPrice,
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
// Create Order from Cart
router.post("/create-from-cart", async (req, res) => {
  try {
    const { userId } = req.body;
    // Find the user's cart
    const cart = await Cart.findOne({ userId }).populate("items.menuId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty or not found" });
    }

    // Prepare order items and calculate total price
    const orderItems = cart.items.map((item) => ({
      menu_item_id: item.menuId._id,
      quantity: item.quantity,
      price: item.menuId.price * item.quantity,
    }));

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

    // Create the order
    const newOrder = new Order({
      user_id: userId,
      order_items: orderItems,
      total_price: totalPrice,
    });
    await newOrder.save();
    cart.items = [];
    await cart.save();

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get All Orders for a User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id }).populate(
      "order_items.menu_item_id"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get Order by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    }).populate("order_items.menu_item_id");
    if (!order) return res.status(404).json({ msg: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update Order Status
router.put("/order/:id/status", authMiddleware, async (req, res) => {
  const { status, rating, comments } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (
      ["pending", "accept"].includes(order.status) &&
      ["canceled"].includes(status)
    ) {
      order.status = status;
    } else if (
      ["accept"].includes(order.status) &&
      ["delivering", "complete"].includes(status)
    ) {
      order.status = status;
      if (status === "complete") {
        order.rating = rating;
        order.comments = comments;
      }
    } else {
      return res.status(400).json({ msg: "Invalid status transition" });
    }

    order.updated_at = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
