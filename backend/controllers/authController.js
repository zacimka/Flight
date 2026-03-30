const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    let finalRole = 'user';
    if (role === 'admin' || role === 'agent') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(403).json({ message: 'Only an existing admin can create elevated accounts' });
      }
      const tokenStr = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);
        const requester = await User.findById(decoded.id);
        if (!requester || requester.role !== 'admin') {
          return res.status(403).json({ message: 'Only an existing admin can create elevated accounts' });
        }
        finalRole = role;
      } catch (err) {
        return res.status(403).json({ message: 'Invalid or missing admin token' });
      }
    }

    const user = await User.create({ name, email, password, role: finalRole });
    const token = generateToken(user);
    return res.status(201).json({ data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`Password match result for ${email}: ${isMatch}`);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
