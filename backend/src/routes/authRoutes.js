const express = require('express');
const router = express.Router();

const {
  login,
  registerTenant,
  getCurrentUser
} = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');
const tenantIsolation = require('../middleware/tenantIsolation');

// Public routes (NO auth, NO tenant isolation)
router.post('/login', login);
router.post('/register-tenant', registerTenant);

// Protected route (auth + tenant context)
router.get('/me', authMiddleware, tenantIsolation, getCurrentUser);

module.exports = router;
