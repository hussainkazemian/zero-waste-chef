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

/**
 * @api {get} /comments/:recipeId Get Comments for a Recipe
 * @apiName GetComments
 * @apiGroup Comments
 * @apiDescription Retrieves all comments for a specific recipe.
 * @apiParam {Number} recipeId The ID of the recipe (in URL path).
 * @apiSuccess {Object[]} comments List of comments.
 * @apiSuccess {Number} comments.id Comment ID.
 * @apiSuccess {Number} comments.user_id ID of the user who posted the comment.
 * @apiSuccess {Number} comments.recipe_id ID of the recipe.
 * @apiSuccess {String} comments.text Comment text.
 * @apiSuccess {String} comments.created_at Timestamp of comment creation.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "user_id": 1,
 *         "recipe_id": 1,
 *         "text": "Great recipe!",
 *         "created_at": "2023-01-01 12:00:00"
 *       }
 *     ]
 */

// Route to get all comments for a specific recipe
router.get('/comments/:recipeId', async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const db = await initializeDatabase();
  const comments = await db.all<Comment[]>('SELECT * FROM comments WHERE recipe_id = ?', [recipeId]);
  res.json(comments);
});

/**
 * @api {post} /comments Create a Comment
 * @apiName CreateComment
 * @apiGroup Comments
 * @apiDescription Adds a new comment to a recipe. Requires authentication.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiParam {Number} recipe_id The ID of the recipe to comment on. (body)
 * @apiParam {String} text The comment text. (body)
 * @apiSuccess {Number} id The ID of the newly created comment.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 1
 *     }
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 */
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
