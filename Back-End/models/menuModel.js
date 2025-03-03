const mongoose = require('mongoose');

// Define Translation Schema
const translationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

// Define Feedback Schema
const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String, required: true },
});

// Define Nutrition Schema
const nutritionSchema = new mongoose.Schema({
  calories: { type: String },
  fat: { type: String },
  saturatedFat: { type: String },
  carbohydrate: { type: String },
  sugar: { type: String },
  dietaryFiber: { type: String },
  protein: { type: String },
  cholesterol: { type: String },
  sodium: { type: String },
});

// Define Menu Schema
const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true }, // Change reference to SubCategory
    image: { type: String },
    nutritional_info: { type: String },
    available_stock: { type: Number, default: 0, min: 0 },
    discount_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount', default: null },
    discount_percent: { type: Number, default: 0, min: 0, max: 100 },
    translations: [translationSchema],
    feedbacks: [feedbackSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ingredients: [{ type: String }],
    allergens: { type: String },
    nutrition: nutritionSchema,
    fullIngredients: { type: String },
    tags: {
      type: [String],
      enum: ['GF', 'VEG', 'KETO', 'LF', 'DF'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && new Set(v).size === v.length;
        },
        message: 'Tags must be unique',
      },
    },
  },
  { timestamps: true }
);

const menuModel = mongoose.model("Menu", menuSchema);
module.exports = menuModel;
