const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * CREATE USER (tenant_admin only)
 * POST /api/users
 */
exports.createUser = async (req, res) => {
  if (req.user.role !== 'tenant_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only tenant admins can create users'
    });
  }

  const { email, password, fullName, role } = req.body || {};
  const tenantId = req.tenantId;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Check user limit
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND is_active = true',
      [tenantId]
    );

    const activeUsers = parseInt(countResult.rows[0].count, 10);

    const tenantResult = await pool.query(
      'SELECT max_users FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (activeUsers >= tenantResult.rows[0].max_users) {
      return res.status(403).json({
        success: false,
        message: 'User limit reached for this tenant'
      });
    }

    // Check email uniqueness per tenant
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
      [email, tenantId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, tenantId, email, passwordHash, fullName, role]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: userId,
        email,
        fullName,
        role
      }
    });

  } catch (err) {
    console.error('CREATE USER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * LIST USERS (tenant scoped)
 * GET /api/users
 */
exports.getUsers = async (req, res) => {
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      SELECT id, email, full_name, role, is_active
      FROM users
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error('GET USERS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * UPDATE USER (tenant_admin only)
 * PATCH /api/users/:id
 */
exports.updateUser = async (req, res) => {
  if (req.user.role !== 'tenant_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only tenant admins can update users'
    });
  }

  const { id } = req.params;
  const { fullName, role, isActive } = req.body || {};
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      UPDATE users
      SET
        full_name = COALESCE($1, full_name),
        role = COALESCE($2, role),
        is_active = COALESCE($3, is_active)
      WHERE id = $4 AND tenant_id = $5
      RETURNING id, email, full_name, role, is_active
      `,
      [fullName, role, isActive, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('UPDATE USER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * DEACTIVATE USER (tenant_admin only)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'tenant_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only tenant admins can delete users'
    });
  }

  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      UPDATE users
      SET is_active = false
      WHERE id = $1 AND tenant_id = $2
      RETURNING id, email
      `,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (err) {
    console.error('DELETE USER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
