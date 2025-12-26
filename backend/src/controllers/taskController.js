const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * CREATE TASK
 * POST /api/tasks
 */
exports.createTask = async (req, res) => {
  const { projectId, title, description, assignedTo } = req.body || {};
  const tenantId = req.tenantId;

  if (!projectId || !title) {
    return res.status(400).json({
      success: false,
      message: 'projectId and title are required'
    });
  }

  try {
    // Ensure project belongs to tenant
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const taskId = uuidv4();

    await pool.query(
      `
      INSERT INTO tasks
      (id, tenant_id, project_id, title, description, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [taskId, tenantId, projectId, title, description, assignedTo || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        id: taskId,
        title,
        status: 'todo'
      }
    });

  } catch (err) {
    console.error('CREATE TASK ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * LIST TASKS (tenant + project scoped)
 * GET /api/tasks?projectId=
 */
exports.getTasks = async (req, res) => {
  const tenantId = req.tenantId;
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'projectId query param required'
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, title, description, status, assigned_to, created_at
      FROM tasks
      WHERE tenant_id = $1 AND project_id = $2
      ORDER BY created_at DESC
      `,
      [tenantId, projectId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error('GET TASKS ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * UPDATE TASK
 * PATCH /api/tasks/:id
 */
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assignedTo } = req.body || {};
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        assigned_to = COALESCE($4, assigned_to)
      WHERE id = $5 AND tenant_id = $6
      RETURNING id, title, status
      `,
      [title, description, status, assignedTo, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('UPDATE TASK ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * DELETE TASK
 * DELETE /api/tasks/:id
 */
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
      `,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (err) {
    console.error('DELETE TASK ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
