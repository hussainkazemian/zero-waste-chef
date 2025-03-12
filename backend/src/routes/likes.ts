import { Router, Request, Response } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

const router = Router();

// Route to handle liking or disliking a recipe
router.post('/likes', authenticate, async (req: Request, res: Response) => {
  // Extract recipe ID and like status from request body
  const { recipe_id, is_like } = req.body;
  const db = await initializeDatabase();

    // Check if the user has already liked or disliked the recipe
  const existing = await db.get('SELECT * FROM likes WHERE user_id = ? AND recipe_id = ?', [req.user!.id, recipe_id]);
  if (existing) {

        // Update the existing like/dislike status
    await db.run('UPDATE likes SET is_like = ? WHERE user_id = ? AND recipe_id = ?', [is_like, req.user!.id, recipe_id]);
  } else {
        // Insert a new like/dislike entry
    await db.run('INSERT INTO likes (user_id, recipe_id, is_like) VALUES (?, ?, ?)', [req.user!.id, recipe_id, is_like]);
  }
  res.status(200).json({ message: 'Vote recorded' });  // Respond with a success message
});


// Route to check if a user has liked a specific recipe
router.get('/likes/:recipeId', authenticate, async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const db = await initializeDatabase();

    // Fetch the like status for the specified recipe and user
  const like = await db.get('SELECT is_like FROM likes WHERE user_id = ? AND recipe_id = ?', [req.user!.id, recipeId]);

    // Respond with the like status or null if not found
  res.json({ liked: like?.is_like ?? null });
});

// Route to get the count of likes and dislikes for a specific recipe
router.get('/likes/count/:recipeId', async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const db = await initializeDatabase();

    // Fetch the count of likes for the specified recipe
  const likes = await db.get('SELECT COUNT(*) as count FROM likes WHERE recipe_id = ? AND is_like = 1', [recipeId]);

    // Fetch the count of dislikes for the specified recipe
  const dislikes = await db.get('SELECT COUNT(*) as count FROM likes WHERE recipe_id = ? AND is_like = 0', [recipeId]);

    // Respond with the counts of likes and dislikes

  res.json({ likes: likes.count, dislikes: dislikes.count });
});

export default router;
