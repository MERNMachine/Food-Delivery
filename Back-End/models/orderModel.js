const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accept', 'delivering', 'complete', 'canceled'],
      default: 'pending',
    },
    total_price: { type: Number, required: true, min: 0 },
    order_date: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    payment_transaction_id: { type: String },
    order_items: [orderItemSchema],
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;