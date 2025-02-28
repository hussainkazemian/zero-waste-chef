import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth';
import { asyncHandler } from '../middleware/asyncHandler'; // Assuming you have this from previous fixes
import { initializeDatabase } from '../db';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

// New endpoint to check for duplicates
router.post('/check-duplicates', asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const db = await initializeDatabase();
  const usernameCheck = await db.get('SELECT id FROM users WHERE username = ?', [username]);
  const emailCheck = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  res.json({
    usernameExists: !!usernameCheck,
    emailExists: !!emailCheck,
  });
}));

export default router;
