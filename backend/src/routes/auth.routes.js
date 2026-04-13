const { Router } = require('express');
const { register, login, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);

module.exports = router;
