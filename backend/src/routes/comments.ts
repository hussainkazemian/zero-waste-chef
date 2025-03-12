import { Router, Request, Response } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

const router = Router();

// Define the structure of a Comment object
interface Comment {
  id?: number;
  user_id: number;
  recipe_id: number;
  text: string;
  created_at?: string;
}

// Route to get all comments for a specific recipe
router.get('/comments/:recipeId', async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const db = await initializeDatabase();
  const comments = await db.all<Comment[]>('SELECT * FROM comments WHERE recipe_id = ?', [recipeId]);
  res.json(comments);
});

  // Fetch all comments for the specified recipe
router.post('/comments', authenticate, async (req: Request, res: Response) => {
  const { recipe_id, text } = req.body;
  const db = await initializeDatabase();

  // Insert the new comment into the database
  const result = await db.run(
    'INSERT INTO comments (user_id, recipe_id, text) VALUES (?, ?, ?)',
    [req.user!.id, recipe_id, text]
  );

  // Respond with the ID of the newly created comment

  res.status(201).json({ id: result.lastID });
});

export default router;
