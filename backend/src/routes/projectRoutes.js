const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantIsolation = require('../middleware/tenantIsolation');

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

router.post('/', auth, tenantIsolation, createProject);
router.get('/', auth, tenantIsolation, getProjects);
router.patch('/:id', auth, tenantIsolation, updateProject);
router.delete('/:id', auth, tenantIsolation, deleteProject);

module.exports = router;
