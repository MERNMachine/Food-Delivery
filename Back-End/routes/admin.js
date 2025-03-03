// Updated Admin Routes with Add and Update Menu Item including Image Handling
const express = require('express');
const Menu = require('../models/menuModel');
const Discount = require('../models/discountModel');
const {Category, SubCategory} = require('../models/categoryModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Configure Multer for Image Upload


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.post('/menu', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id, // This should reference SubCategory
      nutritional_info,
      available_stock,
      discount_id,
      ingredients,
      allergens,
      nutrition,
      fullIngredients,
      tags,
    } = req.body;

    const imagePath = req.file ? `${req.file.filename}` : null;
    const discountPercent = discount_id ? (discount_percent ? discount_percent : 100) : 100; // Default to 100% if no discount

    const newMenu = new Menu({
      name,
      description,
      price,
      category_id, // This should reference SubCategory
      nutritional_info,
      available_stock,
      image: imagePath,
      discount_id: discount_id || null,
      discount_percent: discountPercent,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      allergens,
      nutrition: nutrition ? JSON.parse(nutrition) : {},
      fullIngredients,
      tags: tags ? JSON.parse(tags) : [],
    });

    await newMenu.save();
    res.status(201).json(newMenu);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update Menu Item
router.put('/menu/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ msg: 'Menu item not found' });

    const {
      name,
      description,
      price,
      category_id, // This should reference SubCategory
      nutritional_info,
      available_stock,
      ingredients,
      allergens,
      nutrition,
      fullIngredients,
      tags,
    } = req.body;

    // Handle Image Replacement
    if (req.file) {
      const oldImage = menu.image;
      if (oldImage && fs.existsSync(path.join(__dirname, `../uploads/${oldImage}`))) {
      fs.unlinkSync(path.join(__dirname, `../uploads/${oldImage}`));
      }
      menu.image = `${req.file.filename}`;
    }

    menu.name = name || menu.name;
    menu.description = description || menu.description;
    menu.price = price || menu.price;
    menu.category_id = category_id || menu.category_id; // This should reference SubCategory
    menu.nutritional_info = nutritional_info || menu.nutritional_info;
    menu.available_stock = available_stock || menu.available_stock;
    menu.ingredients = ingredients ? JSON.parse(ingredients) : menu.ingredients;
    menu.allergens = allergens || menu.allergens;
    menu.nutrition = nutrition ? JSON.parse(nutrition) : menu.nutrition;
    menu.fullIngredients = fullIngredients || menu.fullIngredients;
    menu.tags = tags ? JSON.parse(tags) : menu.tags;

    await menu.save();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Remove Menu Item
router.delete('/menu/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ msg: 'Menu item not found' });

    // Delete Image from File System
    const imagePath = menu.image;
    if (imagePath && fs.existsSync(path.join(__dirname, `../uploads/${imagePath}`))) {
      fs.unlinkSync(path.join(__dirname, `../uploads/${imagePath}`));
    }

    await menu.deleteOne();
    res.json({ msg: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


router.post('/category', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { main, sub } = req.body;

    // Ensure sub is an array
    const subArray = Array.isArray(sub) ? sub : JSON.parse(sub);

    // Create subcategories and get their IDs
    const subCategoryIds = await Promise.all(
      subArray.map(async (subName) => {
        const subCategory = new SubCategory({ name: subName });
        await subCategory.save();
        return subCategory._id;
      })
    );

    // Create the main category with subcategory IDs
    const newCategory = new Category({
      main,
      sub: subCategoryIds,
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add SubMenu to Existing Category
router.post('/category/:id/submenu', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ msg: 'Category not found' });

    category.sub.push({ name });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Remove Main Category
router.delete('/category/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // Optionally, you can also delete all subcategories associated with this category
    await SubCategory.deleteMany({ _id: { $in: category.sub } });

    res.json({ msg: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


router.put('/category/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update SubCategory Name
router.put('/category/:id/subcategory/:subId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id).populate('sub');
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    const subCategory = category.sub.id(req.params.subId);
    if (!subCategory) return res.status(404).json({ msg: 'SubCategory not found' });

    subCategory.name = name || subCategory.name;
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get Category List
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('sub');
    const categoryList = categories.map(category => ({
      _id: category._id,
      name: category.main,
      sub: category.sub.map(sub => ({
        _id: sub._id,
        name: sub.name
      }))
    }));
    res.json(categoryList);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Manage Discounts
router.put('/discount/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!discount) return res.status(404).json({ msg: 'Discount not found' });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/discount/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ msg: 'Discount not found' });
    res.json({ msg: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = {};
    if (search) {
      query.email = { $regex: new RegExp(search, 'i') }; // Case-insensitive email search
    }
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'user_id',
        match: search ? { email: { $regex: new RegExp(search, 'i') } } : {},
        select: 'email firstName lastName',
      })
      .populate('order_items.menu_item_id');

    // Filter out orders where user_id didn't match (when search is applied)
    const filteredOrders = search ? orders.filter(order => order.user_id) : orders;

    res.json(filteredOrders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get Order by ID (Admin)
router.get('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'email firstName lastName')
      .populate('order_items.menu_item_id');

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update Order Status
router.put('/order/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (['pending', 'accept'].includes(order.status) && ['canceled'].includes(status)) {
      order.status = status;
    } else if (['accept'].includes(order.status) && ['delivering', 'complete'].includes(status)) {
      order.status = status;
    } else {
      return res.status(400).json({ msg: 'Invalid status transition' });
    }

    order.updated_at = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users with optional search query
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { search } = req.query;
  try {
    const query = search
      ? {
          $or: [
            { firstName: new RegExp(search, 'i') },
            { lastName: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
          ],
        }
      : {};
    const users = await User.find(query).populate('cart').populate('favorites');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update user by ID
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).populate('cart').populate('favorites');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Delete user by ID
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;