const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  birthday: { type: Date },
  googleId: { type: String },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Favorite' }],
});

userSchema.methods.hashPassword = async function(password) {
  this.password = await bcrypt.hash(password, 12);
};

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
