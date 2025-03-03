const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    percent: { type: Number, required: true, min: 0, max: 100 },
    expiredTime: { type: Date, required: true },
    menu_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
  },
  { timestamps: true }
);

const Discount = mongoose.models.Discount || mongoose.model('Discount', discountSchema);
module.exports = Discount;