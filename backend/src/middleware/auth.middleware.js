const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userModel = require('../models/user.model');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorised — no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Not authorised — user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorised — invalid token' });
  }
};

module.exports = { protect };
