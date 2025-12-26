const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantIsolation = require('../middleware/tenantIsolation');

const {
  createUser,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.post('/', auth, tenantIsolation, createUser);
router.get('/', auth, tenantIsolation, getUsers);
router.patch('/:id', auth, tenantIsolation, updateUser);
router.delete('/:id', auth, tenantIsolation, deleteUser);

module.exports = router;
