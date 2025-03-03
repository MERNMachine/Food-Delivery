const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'Authorization required' });
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
   
    const user = await User.findById(req.userId);
  
    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ msg: 'Access restricted to admins only' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
