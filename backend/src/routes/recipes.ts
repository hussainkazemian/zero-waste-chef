import { Router, Request, Response } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

const router = Router();
const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });


// Define the structure of an Ingredient object
interface Ingredient {
  id?: number;
  user_id: number;
  name: string;
  expiration_date?: string;
}

// Define the structure of a Recipe object
interface Recipe {
  id?: number;
  user_id: number;
  name: string;
  category: string;
  ingredients: string;
  instructions: string;
  dietary_info?: string;
  prep_time?: number;
  cook_time?: number;
  created_at?: string;
}

// Route to get all recipes, optionally filtered by category
router.get('/recipes', async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const category = req.query.category as string | undefined;
  let query = 'SELECT * FROM recipes';
  const params: any[] = [];

  if (category) {
    query += ' WHERE category = ?'; // Add category filter if provided
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';  // Order by creation date

  const recipes = await db.all<Recipe[]>(query, params); // Fetch recipes from the database
  for (const recipe of recipes) {

      // Attach images to each recipe
    const images = await db.all('SELECT path FROM recipe_images WHERE recipe_id = ?', [recipe.id]);
    (recipe as any).images = images.map(img => `/uploads/${path.basename(img.path)}`);
  }
  res.json(recipes);
});

// Admin-only: Delete a recipe
router.delete('/recipes/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  const db = await initializeDatabase();

  const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user!.id]);

  // Ensure the user is an admin
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  const recipeId = req.params.id;
    // Delete associated images, comments, likes, and the recipe itself
  await db.run('DELETE FROM recipe_images WHERE recipe_id = ?', [recipeId]);
  await db.run('DELETE FROM comments WHERE recipe_id = ?', [recipeId]);
  await db.run('DELETE FROM likes WHERE recipe_id = ?', [recipeId]);
  await db.run('DELETE FROM recipes WHERE id = ?', [recipeId]);
  res.status(204).send();
});

// Admin-only: Update a recipe
router.put('/recipes/:id', authenticate, upload.array('images', 5), async (req: Request, res: Response): Promise<void> => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user!.id]);

    // Ensure the user is an admin
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  const { name, category, ingredients, instructions, dietary_info, prep_time, cook_time } = req.body;
  const files = req.files as Express.Multer.File[];
  const recipeId = req.params.id;

    // Update the recipe details
  await db.run(
    `UPDATE recipes
     SET name = ?, category = ?, ingredients = ?, instructions = ?, dietary_info = ?, prep_time = ?, cook_time = ?
     WHERE id = ?`,
    [name, category, ingredients, instructions, dietary_info, prep_time, cook_time, recipeId]
  );

    // Handle image updates
  if (files && files.length > 0) {
    await db.run('DELETE FROM recipe_images WHERE recipe_id = ?', [recipeId]);
    for (const file of files) {
      await db.run('INSERT INTO recipe_images (recipe_id, path) VALUES (?, ?)', [recipeId, file.path]);
    }
  }

  res.json({ message: 'Recipe updated successfully' });
});

// Route to add a new recipe
router.post('/recipes', authenticate, upload.array('images', 5), async (req: Request, res: Response) => {
  const { name, category, ingredients, instructions, dietary_info, prep_time, cook_time } = req.body;
  const files = req.files as Express.Multer.File[];
  const db = await initializeDatabase();

    // Insert the new recipe into the database
  const result = await db.run(
    'INSERT INTO recipes (user_id, name, category, ingredients, instructions, dietary_info, prep_time, cook_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user!.id, name, category, ingredients, instructions, dietary_info, prep_time, cook_time]
  );
  const recipeId = result.lastID;

    // Handle image uploads
  if (files) {
    for (const file of files) {
      await db.run('INSERT INTO recipe_images (recipe_id, path) VALUES (?, ?)', [recipeId, file.path]);
    }
  }
  res.status(201).json({ id: recipeId });
});


// Route to get suggested recipes based on user's ingredients TODO -not functional yet-
router.get('/suggested-recipes', authenticate, async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const searchQuery = req.query.search as string | undefined;

    // Fetch user's ingredients
  const ingredients = await db.all<Ingredient[]>('SELECT name, expiration_date FROM ingredients WHERE user_id = ?', [req.user!.id]);

  const userIngredients = ingredients.map(i => i.name.toLowerCase());

  // Fetch all recipes
  const allRecipes = await db.all<Recipe[]>('SELECT * FROM recipes');

    // Filter and sort recipes based on user's ingredients and search query
  const suggested = allRecipes
    .filter(recipe => {
      const recipeIngredients = recipe.ingredients.toLowerCase().split(', ');
      return recipeIngredients.some(ri => userIngredients.includes(ri) || (searchQuery && ri.includes(searchQuery.toLowerCase())));
    })
    .sort((a, b) => {
      const aExpiring = ingredients.some(i => i.expiration_date && new Date(i.expiration_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      const bExpiring = ingredients.some(i => i.expiration_date && new Date(i.expiration_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      if (aExpiring === bExpiring) {
        const aDate = new Date(a.created_at || '').getTime();
        const bDate = new Date(b.created_at || '').getTime();
        return bDate - aDate;
      }
      return aExpiring ? -1 : 1;
    });

      // Attach images to each suggested recipe -not funtional-

  for (const recipe of suggested) {
    const images = await db.all('SELECT path FROM recipe_images WHERE recipe_id = ?', [recipe.id]);
    (recipe as any).images = images.map(img => `/uploads/${path.basename(img.path)}`);
  }

  res.json(suggested);
});

export default router;

