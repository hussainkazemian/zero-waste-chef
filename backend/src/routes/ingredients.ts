import { Router, Request, Response } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

const router = Router();

interface Ingredient {
  id?: number;
  user_id: number;
  name: string;
  expiration_date?: string;
}

router.get('/ingredients', authenticate, async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const ingredients = await db.all<Ingredient[]>('SELECT * FROM ingredients WHERE user_id = ?', [req.user!.id]);
  res.json(ingredients);
});

router.post('/ingredients', authenticate, async (req: Request, res: Response) => {
  const { name, expiration_date } = req.body;
  const db = await initializeDatabase();
  const result = await db.run(
    'INSERT INTO ingredients (user_id, name, expiration_date) VALUES (?, ?, ?)',
    [req.user!.id, name, expiration_date || null]
  );
  res.status(201).json({ id: result.lastID });
});

export default router;
