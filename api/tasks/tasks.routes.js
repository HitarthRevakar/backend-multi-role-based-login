const express = require('express');
const router = express.Router();
const tasksController = require('./tasks.controller');
const { authenticateToken } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/permission');

// Apply authentication to all task routes
router.use(authenticateToken);

// GET /api/tasks (requires tasks:read)
router.get('/', requirePermission('tasks:read'), tasksController.getAllTasks);

// POST /api/tasks (requires tasks:create)
router.post('/', requirePermission('tasks:create'), tasksController.createTask);

// PUT /api/tasks/:id/status (requires tasks:update)
router.put('/:id/status', requirePermission('tasks:update'), tasksController.updateTask);

// DELETE /api/tasks/:id (requires tasks:delete)
router.delete('/:id', requirePermission('tasks:delete'), tasksController.deleteTask);

module.exports = router;
