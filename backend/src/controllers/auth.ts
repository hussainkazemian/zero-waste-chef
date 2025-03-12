// Import necessary modules for handling HTTP requests, password hashing, JWT, database initialization, and environment variables
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // For hashing passwords
import jwt from 'jsonwebtoken'; // For generating and verifying JSON Web Tokens (JWT)
import { initializeDatabase } from '../db'; // For initializing the SQLite database
import dotenv from 'dotenv'; // For loading environment variables from a .env file

dotenv.config(); // Load environment variables from .env file
// Load environment variables from .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define the User interface to type the user data structure
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
// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Extract user data from the request body
  const { username, email, password, name, family_name, phone_number, profession, age } = req.body;

  try {
    // Initialize the database connection
    const db = await initializeDatabase();
    // Check if a user with the same username or email already exists
    const existingUser = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    // If user exists, return a 400 error with a message
    if (existingUser) {
      res.status(400).json({ message: 'Username or email already exists' });
      return;
    }
    // Hash the user's password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert the new user into the database, with optional fields set to null if not provided
    const result = await db.run(
      'INSERT INTO users (username, email, password, name, family_name, age, phone_number, profession) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, name, family_name, age || null, phone_number || null, profession || null,]
    );
    // Generate a JWT token for the new user, including their ID and username, with a 1-hour expiration
    const token = jwt.sign({ id: result.lastID, username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    // Pass any errors to the error-handling middleware
    next(error);
  }
};
// Handle user login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Extract username/email and password from the request body
  const { usernameOrEmail, password } = req.body;

  try {
    // Initialize the database connection
    const db = await initializeDatabase();
    const user = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [usernameOrEmail, usernameOrEmail]);
    // If user doesn't exist or password doesn't match, return a 401 error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    // Generate a JWT token for the user, including their ID and username, with a 1-hour expiration
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
// Middleware to authenticate requests using JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
// Extract the token from the Authorization header (format: "Bearer <token>")
  const token = req.headers.authorization?.split(' ')[1];
  // If no token is provided, return a 401 error
  if (!token) {

    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    // If no token is provided, return a 401 error
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    // Attach the decoded user data to the request object
    req.user = decoded;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token verification fails, return a 401 error
    res.status(401).json({ message: 'Invalid token' });
  }
};

declare module 'express' {
  interface Request {
    user?: { id: number; username: string };
  }
};

// Handle forgot password requests
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Extract the email from the request body
  const { email } = req.body;
  try {
    // Initialize the database connection
    const db = await initializeDatabase();
    // Find the user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    // If user doesn't exist, return a 404 error
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    // Generate a reset token for the user, including their ID, with a 1-hour expiration
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
   // In production, this token would be sent via email; for now, return it in the response
    res.json({ message: 'Reset link generated', resetToken });
  } catch (error) {
    // Pass any errors to the error-handling middleware
    next(error);
  }
};
// Handle password reset requests
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Extract the reset token and new password from the request body
  const { token, newPassword } = req.body;
  try {
    // Verify the reset token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    // Initialize the database connection
    const db = await initializeDatabase();
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
    // Return a success message
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    // If token verification fails, return a 400 error
    res.status(400).json({ message: 'Invalid or expired token' });
    // Pass any errors to the error-handling middleware
    next(error);
  }
};
