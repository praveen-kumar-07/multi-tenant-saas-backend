const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * =========================
 * LOGIN API
 * POST /api/auth/login
 * =========================
 */


exports.login = async (req, res) => {
  const { tenantSubdomain, email, password } = req.body || {};

  if (!tenantSubdomain || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email, password and tenantSubdomain are required'
    });
  }

  try {
    // 1. Fetch tenant
    const tenantResult = await pool.query(
      'SELECT id, status FROM tenants WHERE subdomain = $1',
      [tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active'
      });
    }

    // 2. Fetch user
    const userResult = await pool.query(
      `SELECT id, email, password_hash, full_name, role, is_active
       FROM users
       WHERE email = $1 AND tenant_id = $2`,
      [email, tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant.id
        },
        token,
        expiresIn: 86400
      }
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.registerTenant = async (req, res) => {
  const {
    tenantName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName
  } = req.body || {};

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check subdomain uniqueness
    const tenantCheck = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (tenantCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists'
      });
    }

    // 2. Create tenant
    const tenantId = uuidv4();
    await client.query(
      `INSERT INTO tenants (id, name, subdomain, status)
       VALUES ($1, $2, $3, 'active')`,
      [tenantId, tenantName, subdomain]
    );

    // 3. Hash admin password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // 4. Create tenant admin
    const userId = uuidv4();
    await client.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, 'tenant_admin')`,
      [userId, tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId,
        subdomain,
        adminUser: {
          id: userId,
          email: adminEmail,
          fullName: adminFullName,
          role: 'tenant_admin'
        }
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('REGISTER TENANT ERROR:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
};

/**
 * ===============================
 * GET CURRENT USER API
 * GET /api/auth/me
 * ===============================
 */
exports.getCurrentUser = async (req, res) => {
  const { userId } = req.user;
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.is_active,
        t.id AS tenant_id,
        t.name AS tenant_name,
        t.subdomain,
        t.subscription_plan,
        t.max_users,
        t.max_projects
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND t.id = $2
      `,
      [userId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        isActive: row.is_active,
        tenant: {
          id: row.tenant_id,
          name: row.tenant_name,
          subdomain: row.subdomain,
          subscriptionPlan: row.subscription_plan,
          maxUsers: row.max_users,
          maxProjects: row.max_projects
        }
      }
    });

  } catch (err) {
    console.error('GET CURRENT USER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


