import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth';
import { asyncHandler } from '../middleware/asyncHandler'; // Middleware to handle async errors
import { initializeDatabase } from '../db';

const router = Router();
// Route to handle user registration
router.post('/register', asyncHandler(register));

// Route to handle user login
router.post('/login', asyncHandler(login));

// Route to handle forgot password requests
router.post('/forgot-password', asyncHandler(forgotPassword));

// Route to handle password reset
router.post('/reset-password', asyncHandler(resetPassword));

// New endpoint to check for duplicate usernames or emails
router.post('/check-duplicates', asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  const db = await initializeDatabase();

  // Check if the username already exists in the database
  const usernameCheck = await db.get('SELECT id FROM users WHERE username = ?', [username]);

  // Check if the email already exists in the database
  const emailCheck = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  res.json({
    usernameExists: !!usernameCheck,
    emailExists: !!emailCheck,
  });
}));

export default router;
