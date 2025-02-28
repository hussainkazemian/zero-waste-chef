import { Router, Request, Response } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

const router = Router();

router.post('/likes', authenticate, async (req: Request, res: Response) => {
  const { recipe_id, is_like } = req.body;
  const db = await initializeDatabase();
  const existing = await db.get('SELECT * FROM likes WHERE user_id = ? AND recipe_id = ?', [req.user!.id, recipe_id]);
  if (existing) {
    await db.run('UPDATE likes SET is_like = ? WHERE user_id = ? AND recipe_id = ?', [is_like, req.user!.id, recipe_id]);
  } else {
    await db.run('INSERT INTO likes (user_id, recipe_id, is_like) VALUES (?, ?, ?)', [req.user!.id, recipe_id, is_like]);
  }
  res.status(200).json({ message: 'Vote recorded' });
});

router.get('/likes/:recipeId', authenticate, async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const db = await initializeDatabase();
  const like = await db.get('SELECT is_like FROM likes WHERE user_id = ? AND recipe_id = ?', [req.user!.id, recipeId]);
  res.json({ liked: like?.is_like ?? null });
});

router.get('/likes/count/:recipeId', async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const db = await initializeDatabase();
  const likes = await db.get('SELECT COUNT(*) as count FROM likes WHERE recipe_id = ? AND is_like = 1', [recipeId]);
  const dislikes = await db.get('SELECT COUNT(*) as count FROM likes WHERE recipe_id = ? AND is_like = 0', [recipeId]);
  res.json({ likes: likes.count, dislikes: dislikes.count });
});

export default router;
