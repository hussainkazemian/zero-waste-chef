import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth';
import { asyncHandler } from '../middleware/asyncHandler'; // Middleware to handle async errors
import { initializeDatabase } from '../db';

const router = Router();

/**
 * @api {post} /auth/register Register a New User
 * @apiName RegisterUser
 * @apiGroup Auth
 * @apiDescription Registers a new user and returns a JWT token.
 * @apiParam {String} username User's username (minimum 4 characters). (body)
 * @apiParam {String} email User's email address (must be a valid email). (body)
 * @apiParam {String} password User's password (minimum 8 characters, must include uppercase, lowercase, numbers, and special characters). (body)
 * @apiParam {String} name User's first name. (body)
 * @apiParam {String} family_name User's family name. (body)
 * @apiParam {String} [phone_number] User's phone number (optional). (body)
 * @apiParam {String} [profession] User's profession (optional). (body)
 * @apiParam {Number} [age] User's age (optional). (body)
 * @apiSuccess {String} token JWT token for the registered user.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 * @apiError (400) {Object} BadRequest Username or email already exists.
 */

// Route to handle user registration
router.post('/register', asyncHandler(register));

/**
 * @api {post} /auth/login User Login
 * @apiName LoginUser
 * @apiGroup Auth
 * @apiDescription Logs in a user and returns a JWT token.
 * @apiParam {String} usernameOrEmail User's username or email. (body)
 * @apiParam {String} password User's password. (body)
 * @apiSuccess {String} token JWT token for the logged-in user.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 * @apiError (401) {Object} Unauthorized Invalid credentials.
 */

// Route to handle user login
router.post('/login', asyncHandler(login));

/**
 * @api {post} /auth/forgot-password Forgot Password
 * @apiName ForgotPassword
 * @apiGroup Auth
 * @apiDescription Generates a password reset token for the user.
 * @apiParam {String} email User's email address. (body)
 * @apiSuccess {String} message Success message.
 * @apiSuccess {String} resetToken Password reset token (in production, this would be sent via email).
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Reset link generated",
 *       "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 * @apiError (404) {Object} NotFound User not found.
 */

// Route to handle forgot password requests
router.post('/forgot-password', asyncHandler(forgotPassword));

/**
 * @api {post} /auth/reset-password Reset Password
 * @apiName ResetPassword
 * @apiGroup Auth
 * @apiDescription Resets the user's password using a reset token.
 * @apiParam {String} token Password reset token. (body)
 * @apiParam {String} newPassword New password (minimum 6 characters). (body)
 * @apiSuccess {String} message Success message.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Password reset successfully"
 *     }
 * @apiError (400) {Object} BadRequest Invalid or expired token.
 */

// Route to handle password reset
router.post('/reset-password', asyncHandler(resetPassword));

/**
 * @api {post} /auth/check-duplicates Check for Duplicate Username or Email
 * @apiName CheckDuplicates
 * @apiGroup Auth
 * @apiDescription Checks if a username or email is already in use.
 * @apiParam {String} username Username to check. (body)
 * @apiParam {String} email Email to check. (body)
 * @apiSuccess {Boolean} usernameExists Indicates if the username is already taken.
 * @apiSuccess {Boolean} emailExists Indicates if the email is already registered.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "usernameExists": true,
 *       "emailExists": false
 *     }
 */

// New endpoint to check for duplicate usernames or emails
router.post('/check-duplicates', asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  const db = await initializeDatabase();

  // Check if the username already exists in the database
  const usernameCheck = await db.get('SELECT id FROM users WHERE username = ?', [username]);

  // Check if the email already exists in the database
  const emailCheck = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  res.json({
    usernameExists: !!usernameCheck,
    emailExists: !!emailCheck,
  });
}));

export default router;
