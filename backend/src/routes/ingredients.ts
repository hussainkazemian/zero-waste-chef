import { Router, Request, Response } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

const router = Router();

// Define the structure of an Ingredient object
interface Ingredient {
  id?: number;
  user_id: number;
  name: string;
  expiration_date?: string;
}

// Route to get all ingredients for the authenticated user
router.get('/ingredients', authenticate, async (req: Request, res: Response) => {
  const db = await initializeDatabase();

    // Fetch all ingredients for the authenticated user
  const ingredients = await db.all<Ingredient[]>('SELECT * FROM ingredients WHERE user_id = ?', [req.user!.id]);
  res.json(ingredients);
});

// Route to add a new ingredient for the authenticated user
router.post('/ingredients', authenticate, async (req: Request, res: Response) => {
  const { name, expiration_date } = req.body;
  const db = await initializeDatabase();

    // Insert the new ingredient into the database
  const result = await db.run(
    'INSERT INTO ingredients (user_id, name, expiration_date) VALUES (?, ?, ?)',
    [req.user!.id, name, expiration_date || null]
  );

    // Respond with the ID of the newly created ingredient
  res.status(201).json({ id: result.lastID });
});

export default router;
