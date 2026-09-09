import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}