import { Router, Request, Response, NextFunction } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

// Async handler wrapper ensuring Promise<void>
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const router = Router();

router.get('/user', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user!.id]);
  res.json(user);
}));

router.get('/user/activities', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const likes = await db.all('SELECT recipe_id, is_like FROM likes WHERE user_id = ?', [req.user!.id]);
  const comments = await db.all('SELECT recipe_id, text, created_at FROM comments WHERE user_id = ?', [req.user!.id]);
  const recipes = await db.all('SELECT id, name FROM recipes WHERE user_id = ?', [req.user!.id]);
  res.json({ likes, comments, recipes });
}));

router.get('/all-activities', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user!.id]);
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  const likes = await db.all('SELECT user_id, recipe_id, is_like FROM likes');
  const comments = await db.all('SELECT user_id, recipe_id, text, created_at FROM comments');
  const recipes = await db.all('SELECT user_id, id, name FROM recipes');
  res.json({ likes, comments, recipes });
}));

export default router;
