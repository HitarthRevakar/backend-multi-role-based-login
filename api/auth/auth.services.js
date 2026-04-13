const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');

class AuthService {
  /**
   * Processes the login business logic
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} The JWT token and User data
   */
  async loginUser(email, password) {
    // 1. Fetch user by email
    const user = await authModel.getUserByEmail(email);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // 2. Check if user is active
    if (!user.is_active) {
      const error = new Error('Your Account is Deactivated !');
      error.statusCode = 403;
      throw error;
    }

    // 3. Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Return success payload
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async registerUser(name, email, password) {
    // 1. Check if user already exists
    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      const error = new Error('Email already exists');
      error.statusCode = 400;
      throw error;
    }

    // 2. Fetch the default role ('user')
    const userRole = await authModel.getRoleByName('user');
    if (!userRole) {
      const error = new Error('Default role not found');
      error.statusCode = 500;
      throw error;
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Create User
    const newUser = await authModel.createUser({
      name,
      email,
      password_hash,
      role_id: userRole.id,
      is_active: true
    });

    // 5. Generate JWT to auto-login
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: 'user', name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'user'
      }
    };
  }
}

module.exports = new AuthService();
