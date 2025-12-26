/**
 * Tenant Isolation Middleware
 * Ensures every request is scoped to the logged-in tenant
 */
module.exports = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant context missing'
    });
  }

  // Attach tenantId to request for controllers
  req.tenantId = req.user.tenantId;

  next();
};
