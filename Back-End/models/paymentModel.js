import mongoose from 'mongoose';

// Define Payment Schema
const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },  
  payment_date: { type: Date, required: true }, 
  amount: { type: Number, required: true }, 
  transaction_id: { type: String, required: true }, 
}, { timestamps: true }); 

const paymentModel = mongoose.model.payment || mongoose.model('payment',paymentSchema);
export default paymentModel;