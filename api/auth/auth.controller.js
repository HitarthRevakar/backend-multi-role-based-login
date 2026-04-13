const authService = require('./auth.services');

class AuthController {

  // ------------------ Login ------------------- //
  async login(req, res, next) {
    try {
      // Body validation is already successfully handled by express-validator middleware in routes
      const { email, password } = req.body;

      // 1. Call service layer
      const result = await authService.loginUser(email, password);

      // 2. Send response
      return res.status(200).json({
        message: 'Login successful',
        ...result
      });
      
    } catch (err) {
      // Handle known service errors or forward to global error handler
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
      }
      console.error(err);
      next(err);
    }
  }

  // ------------------ Register ------------------- //
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      
      const result = await authService.registerUser(name, email, password);

      return res.status(201).json({
        message: 'Registration successful',
        ...result
      });

    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
      }
      console.error(err);
      next(err);
    }
  }
}

module.exports = new AuthController();
