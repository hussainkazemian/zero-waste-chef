import { Router, Request, Response, NextFunction } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

// Async handler wrapper to catch and handle errors in async functions
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const router = Router();

// Route to get the authenticated user's profile information
router.get('/user', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user!.id]);
  res.json(user);
}));

// Route to get the authenticated user's activities
router.get('/user/activities', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const likes = await db.all('SELECT recipe_id, is_like FROM likes WHERE user_id = ?', [req.user!.id]);
  const comments = await db.all('SELECT recipe_id, text, created_at FROM comments WHERE user_id = ?', [req.user!.id]);
  const recipes = await db.all('SELECT id, name FROM recipes WHERE user_id = ?', [req.user!.id]);
  res.json({ likes, comments, recipes });
}));

// Route to get the authenticated user's all (admin-only)

router.get('/all-activities', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user!.id]);
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  // Fetch all likes,comments,recipes
  const likes = await db.all('SELECT user_id, recipe_id, is_like FROM likes');
  const comments = await db.all('SELECT user_id, recipe_id, text, created_at FROM comments');
  const recipes = await db.all('SELECT user_id, id, name FROM recipes');
  res.json({ likes, comments, recipes });
}));

// Admin-only: Get all users
router.get('/users', authenticate, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user!.id]);
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  const users = await db.all('SELECT id, username, email, name, family_name, profession, age, role FROM users');
  res.json(users);
}));

// Admin-only: Delete a user
router.delete('/users/:id', authenticate, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user!.id]);
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

   // Extract user ID from URL parameters
  const userId = req.params.id;
  await db.run('DELETE FROM recipes WHERE user_id = ?', [userId]);
  await db.run('DELETE FROM ingredients WHERE user_id = ?', [userId]);
  await db.run('DELETE FROM comments WHERE user_id = ?', [userId]);
  await db.run('DELETE FROM likes WHERE user_id = ?', [userId]);
  await db.run('DELETE FROM users WHERE id = ?', [userId]);
  res.status(204).send();
}));

export default router;
