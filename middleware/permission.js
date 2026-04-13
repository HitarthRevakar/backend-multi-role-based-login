const db = require('../db/config');

function requirePermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      const user = req.user; // Set by authenticateToken middleware
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if user is admin 
      if (user.role === 'admin') {
        return next();
      }

      // Query the database for user permissions map
      const permissionRecord = await db('user_permissions')
        .join('permissions', 'user_permissions.permission_id', 'permissions.id')
        .where('user_permissions.user_id', user.id)
        .andWhere('permissions.name', requiredPermission)
        .first();

      if (!permissionRecord) {
        return res.status(403).json({ message: `Access denied. Missing permission: ${requiredPermission}` });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
}

module.exports = {
  requirePermission
};
