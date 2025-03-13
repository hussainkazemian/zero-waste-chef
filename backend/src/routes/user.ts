import { Router, Request, Response, NextFunction } from 'express';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

// Async handler wrapper to catch and handle errors in async functions
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const router = Router();

/**
 * @api {get} /user Get User Profile
 * @apiName GetUserProfile
 * @apiGroup User
 * @apiDescription Retrieves the profile information of the authenticated user.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiSuccess {Object} user User profile details.
 * @apiSuccess {Number} user.id User ID.
 * @apiSuccess {String} user.username Username.
 * @apiSuccess {String} user.email Email address.
 * @apiSuccess {String} user.name First name.
 * @apiSuccess {String} user.family_name Family name.
 * @apiSuccess {String} [user.profession] Profession.
 * @apiSuccess {Number} [user.age] Age.
 * @apiSuccess {String} user.role User role (e.g., user, admin).
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "username": "john_doe",
 *       "email": "john@example.com",
 *       "name": "John",
 *       "family_name": "Doe",
 *       "profession": "Chef",
 *       "age": 30,
 *       "role": "user"
 *     }
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 */

// Route to get the authenticated user's profile information
router.get('/user', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user!.id]);
  res.json(user);
}));

/**
 * @api {get} /user/activities Get User Activities
 * @apiName GetUserActivities
 * @apiGroup User
 * @apiDescription Retrieves the activities (likes, comments, recipes) of the authenticated user.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiSuccess {Object} activities User activities.
 * @apiSuccess {Object[]} activities.likes List of likes.
 * @apiSuccess {Number} activities.likes.recipe_id Recipe ID.
 * @apiSuccess {Boolean} activities.likes.is_like Like status (true for like, false for dislike).
 * @apiSuccess {Object[]} activities.comments List of comments.
 * @apiSuccess {Number} activities.comments.recipe_id Recipe ID.
 * @apiSuccess {String} activities.comments.text Comment text.
 * @apiSuccess {String} activities.comments.created_at Timestamp of comment creation.
 * @apiSuccess {Object[]} activities.recipes List of recipes.
 * @apiSuccess {Number} activities.recipes.id Recipe ID.
 * @apiSuccess {String} activities.recipes.name Recipe name.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "likes": [
 *         { "recipe_id": 1, "is_like": true }
 *       ],
 *       "comments": [
 *         { "recipe_id": 1, "text": "Great recipe!", "created_at": "2023-01-01 12:00:00" }
 *       ],
 *       "recipes": [
 *         { "id": 1, "name": "Fried Eggs" }
 *       ]
 *     }
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 */

// Route to get the authenticated user's activities
router.get('/user/activities', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const likes = await db.all('SELECT recipe_id, is_like FROM likes WHERE user_id = ?', [req.user!.id]);
  const comments = await db.all('SELECT recipe_id, text, created_at FROM comments WHERE user_id = ?', [req.user!.id]);
  const recipes = await db.all('SELECT id, name FROM recipes WHERE user_id = ?', [req.user!.id]);
  res.json({ likes, comments, recipes });
}));

/**
 * @api {get} /all-activities Get All Activities (Admin Only)
 * @apiName GetAllActivities
 * @apiGroup User
 * @apiDescription Retrieves all activities (likes, comments, recipes) in the system. Requires admin access.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiSuccess {Object} activities All activities.
 * @apiSuccess {Object[]} activities.likes List of likes.
 * @apiSuccess {Number} activities.likes.user_id User ID.
 * @apiSuccess {Number} activities.likes.recipe_id Recipe ID.
 * @apiSuccess {Boolean} activities.likes.is_like Like status.
 * @apiSuccess {Object[]} activities.comments List of comments.
 * @apiSuccess {Number} activities.comments.user_id User ID.
 * @apiSuccess {Number} activities.comments.recipe_id Recipe ID.
 * @apiSuccess {String} activities.comments.text Comment text.
 * @apiSuccess {String} activities.comments.created_at Timestamp of comment creation.
 * @apiSuccess {Object[]} activities.recipes List of recipes.
 * @apiSuccess {Number} activities.recipes.user_id User ID.
 * @apiSuccess {Number} activities.recipes.id Recipe ID.
 * @apiSuccess {String} activities.recipes.name Recipe name.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "likes": [
 *         { "user_id": 1, "recipe_id": 1, "is_like": true }
 *       ],
 *       "comments": [
 *         { "user_id": 1, "recipe_id": 1, "text": "Great recipe!", "created_at": "2023-01-01 12:00:00" }
 *       ],
 *       "recipes": [
 *         { "user_id": 1, "id": 1, "name": "Fried Eggs" }
 *       ]
 *     }
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 * @apiError (403) {Object} Forbidden Admin access required.
 */

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

/**
 * @api {get} /users Get All Users (Admin Only)
 * @apiName GetAllUsers
 * @apiGroup User
 * @apiDescription Retrieves a list of all users in the system. Requires admin access.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiSuccess {Object[]} users List of users.
 * @apiSuccess {Number} users.id User ID.
 * @apiSuccess {String} users.username Username.
 * @apiSuccess {String} users.email Email address.
 * @apiSuccess {String} users.name First name.
 * @apiSuccess {String} users.family_name Family name.
 * @apiSuccess {String} [users.profession] Profession.
 * @apiSuccess {Number} [users.age] Age.
 * @apiSuccess {String} users.role User role.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "username": "john_doe",
 *         "email": "john@example.com",
 *         "name": "John",
 *         "family_name": "Doe",
 *         "profession": "Chef",
 *         "age": 30,
 *         "role": "user"
 *       }
 *     ]
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 * @apiError (403) {Object} Forbidden Admin access required.
 */

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

/**
 * @api {delete} /users/:id Delete a User (Admin Only)
 * @apiName DeleteUser
 * @apiGroup User
 * @apiDescription Deletes a user and their associated data (recipes, ingredients, comments, likes). Requires admin access.
 * @apiHeader {String} Authorization Bearer token (e.g., "Bearer <token>").
 * @apiParam {Number} id The ID of the user to delete (in URL path).
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 * @apiError (401) {Object} Unauthorized Missing or invalid token.
 * @apiError (403) {Object} Forbidden Admin access required.
 */

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
