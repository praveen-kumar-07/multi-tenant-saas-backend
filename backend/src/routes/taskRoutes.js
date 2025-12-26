const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantIsolation = require('../middleware/tenantIsolation');

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.post('/', auth, tenantIsolation, createTask);
router.get('/', auth, tenantIsolation, getTasks);
router.patch('/:id', auth, tenantIsolation, updateTask);
router.delete('/:id', auth, tenantIsolation, deleteTask);

module.exports = router;
