const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * CREATE PROJECT (tenant_admin only)
 * POST /api/projects
 */
exports.createProject = async (req, res) => {
  if (req.user.role !== 'tenant_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only tenant admins can create projects'
    });
  }

  const { name, description } = req.body || {};
  const tenantId = req.tenantId;
  const createdBy = req.user.userId;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Project name is required'
    });
  }

  try {
    // Enforce project limit
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    const projectCount = parseInt(countResult.rows[0].count, 10);

    const tenantResult = await pool.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (projectCount >= tenantResult.rows[0].max_projects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached for this tenant'
      });
    }

    const projectId = uuidv4();

    await pool.query(
      `INSERT INTO projects
       (id, tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, 'active', $5)`,
      [projectId, tenantId, name, description, createdBy]
    );

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        id: projectId,
        name,
        description,
        status: 'active'
      }
    });

  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * LIST PROJECTS (tenant scoped)
 * GET /api/projects
 */
exports.getProjects = async (req, res) => {
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      SELECT id, name, description, status, created_at
      FROM projects
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
    console.error('GET PROJECTS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * UPDATE PROJECT
 * PATCH /api/projects/:id
 */
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body || {};
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status)
      WHERE id = $4 AND tenant_id = $5
      RETURNING id, name, description, status
      `,
      [name, description, status, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('UPDATE PROJECT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * DELETE PROJECT
 * DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      DELETE FROM projects
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
      `,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (err) {
    console.error('DELETE PROJECT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
