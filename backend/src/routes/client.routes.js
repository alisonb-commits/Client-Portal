const { Router } = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getAll, getOne, create, update, remove } = require('../controllers/client.controller');

const router = Router();

router.use(protect); // all client routes require a valid token

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
