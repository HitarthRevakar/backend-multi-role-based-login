const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/config');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// ================= USER ROUTES ================= //

// GET /api/users/me - Get own profile
router.get('/me', async (req, res) => {
  try {
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('users.id', 'users.name', 'users.email', 'users.is_active', 'roles.name as role')
      .where('users.id', req.user.id)
      .first();

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/:id/permissions - Get a user's permissions
router.get('/:id/permissions', async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const permissions = await db('permissions').select('*');
    const userPermsRaw = await db('user_permissions').where('user_id', req.params.id);
    const userPermIds = userPermsRaw.map(p => p.permission_id);

    // Return all possible permissions, with a boolean indicating if this user holds it
    const mapped = permissions.map(p => ({
      ...p,
      granted: userPermIds.includes(p.id)
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ================= ADMIN ROUTES ================= //

// Admin middleware applied to the paths below
router.use(authorizeRole('admin'));


// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('users.id', 'users.name', 'users.email', 'users.is_active', 'roles.name as role')
      .whereNot('roles.name', 'admin')
      .orderBy('users.id', 'asc');

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const validateUserCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email is must required !'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['admin', 'user']).withMessage('Role must be either admin or user'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];

// POST /api/users - Create new user
router.post('/', validateUserCreation, async (req, res) => {

  const { name, email, password, role } = req.body;

  try {
    // Check if email exists
    const existing = await db('users').where({ email }).first();
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    // Get role id
    const roleRecord = await db('roles').where({ name: role }).first();
    if (!roleRecord) return res.status(400).json({ message: 'Invalid role' });

    // Hash password
    const hash = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, hash);

    // Insert
    const [newUser] = await db('users').insert({
      name,
      email,
      password_hash,
      role_id: roleRecord.id,
      is_active: true
    }).returning(['id', 'name', 'email', 'is_active']);

    // Inject default permissions for standard users
    if (role === 'user') {
      const defaultPerms = await db('permissions').whereIn('name', ['tasks:read', 'tasks:create']).select('id');
      if (defaultPerms.length > 0) {
        const permPayload = defaultPerms.map(p => ({ user_id: newUser.id, permission_id: p.id }));
        await db('user_permissions').insert(permPayload);
      }
    }

    res.status(201).json({ message: 'User created successfully', user: { ...newUser, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/users/:id/status - Toggle activate/deactivate
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'is_active flag must be a boolean' });
  }

  try {
    // Prevent admin from deactivating themselves? Maybe later
    if (parseInt(id) === req.user.id && !is_active) {
      return res.status(400).json({ message: 'Cannot deactivate yourself' });
    }

    const updatedRows = await db('users')
      .where({ id })
      .update({ is_active })
      .returning(['id', 'name', 'email', 'is_active']);

    if (!updatedRows.length) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `User status updated successfully`, user: updatedRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/users/:id/permissions - Set a user's permissions
router.post('/:id/permissions', async (req, res) => {
  const { permissionIds } = req.body; // array of permission IDs the user should have

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ message: 'permissionIds must be an array' });
  }

  try {
    // We transactionally delete their current permissions and insert the new array
    await db.transaction(async (trx) => {
      await trx('user_permissions').where('user_id', req.params.id).del();
      
      if (permissionIds.length > 0) {
        const payload = permissionIds.map(pid => ({
          user_id: req.params.id,
          permission_id: pid
        }));
        await trx('user_permissions').insert(payload);
      }
    });

    res.json({ message: 'Permissions updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
