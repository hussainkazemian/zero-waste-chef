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

/**
 * @api {get} /ingredients Get User Ingredients
 * @apiName GetIngredients
 * @apiGroup Ingredients
 * @apiDescription Retrieves all ingredients for the authenticated user.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiSuccess {Object[]} ingredients List of ingredients.
 * @apiSuccess {Number} ingredients.id Ingredient ID.
 * @apiSuccess {Number} ingredients.user_id ID of the user who added the ingredient.
 * @apiSuccess {String} ingredients.name Ingredient name.
 * @apiSuccess {String} [ingredients.expiration_date] Expiration date of the ingredient.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "user_id": 1,
 *         "name": "Eggs",
 *         "expiration_date": "2023-12-31"
 *       }
 *     ]
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 */

// Route to get all ingredients for the authenticated user
router.get('/ingredients', authenticate, async (req: Request, res: Response) => {
  const db = await initializeDatabase();

    // Fetch all ingredients for the authenticated user
  const ingredients = await db.all<Ingredient[]>('SELECT * FROM ingredients WHERE user_id = ?', [req.user!.id]);
  res.json(ingredients);
});

/**
 * @api {post} /ingredients Add a New Ingredient
 * @apiName CreateIngredient
 * @apiGroup Ingredients
 * @apiDescription Adds a new ingredient for the authenticated user.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiParam {String} name Ingredient name. (body)
 * @apiParam {String} [expiration_date] Expiration date of the ingredient (optional). (body)
 * @apiSuccess {Number} id The ID of the newly created ingredient.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 1
 *     }
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 */


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
