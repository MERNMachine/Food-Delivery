import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
export default Favorite;