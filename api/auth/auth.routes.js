const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { loginValidator, registerValidator, validateRequest } = require('./auth.validator');

// POST /api/auth/login
router.post('/login', loginValidator, validateRequest, authController.login);

// POST /api/auth/register
router.post('/register', registerValidator, validateRequest, authController.register);

module.exports = router;
