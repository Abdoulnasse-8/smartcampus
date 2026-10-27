const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { get } = require('../db');

class InvalidCredentialsError extends Error {
  constructor() {
    super('Email ou mot de passe invalide');
    this.name = 'InvalidCredentialsError';
    this.statusCode = 401;
  }
}

async function login(email, password) {
  if (!email || !password) {
    throw new InvalidCredentialsError();
  }

  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    throw new InvalidCredentialsError();
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

module.exports = { login, InvalidCredentialsError };
