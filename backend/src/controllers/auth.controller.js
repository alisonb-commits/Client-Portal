const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { query } = require('../config/db');
const config = require('../config/env');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await userModel.findByEmail(trimmedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userModel.create({ name: trimmedName, email: trimmedEmail, passwordHash });

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(trimmedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await userModel.findByEmail(req.user.email);

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new one' });
      }
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }
      const newHash = await bcrypt.hash(newPassword, 12);
      await query('UPDATE users SET name = $1, password_hash = $2 WHERE id = $3', [name.trim(), newHash, req.user.id]);
    } else {
      await query('UPDATE users SET name = $1 WHERE id = $2', [name.trim(), req.user.id]);
    }

    const updated = await userModel.findById(req.user.id);
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, updateProfile };
