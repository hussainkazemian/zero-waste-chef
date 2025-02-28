import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeDatabase } from '../db';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  name: string;
  family_name: string;
  phone_number?: string;
  profession?: string;
  age?: number;
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, email, password, name, family_name, phone_number, profession, age } = req.body;

  try {
    const db = await initializeDatabase();
    const existingUser = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      res.status(400).json({ message: 'Username or email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (username, email, password, name, family_name, age, phone_number, profession) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, name, family_name, age || null, phone_number || null, profession || null,]
    );

    const token = jwt.sign({ id: result.lastID, username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { usernameOrEmail, password } = req.body;

  try {
    const db = await initializeDatabase();
    const user = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [usernameOrEmail, usernameOrEmail]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

declare module 'express' {
  interface Request {
    user?: { id: number; username: string };
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;
  try {
    const db = await initializeDatabase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    // In production, send this token via email. For now, return it in the response.
    res.json({ message: 'Reset link generated', resetToken });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const db = await initializeDatabase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
    next(error);
  }
};
