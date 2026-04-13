const { body, validationResult } = require('express-validator');

// Validation rules for login route
const loginValidator = [
  body('email').isEmail().withMessage('Email is must required !'),
  body('password').notEmpty().withMessage('Password is must required !')
];

// Validation rules for register route
const registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email is must required !'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Shared middleware to handle validation errors uniformly
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Match the previous concise Joi error format message style
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

module.exports = {
  loginValidator,
  registerValidator,
  validateRequest
};
