import { Router, Request, Response } from 'express';
import express from 'express'; 
import multer from 'multer';
import path from 'path';
import { initializeDatabase } from '../db';
import { authenticate } from '../controllers/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

interface Ingredient {
  id?: number;
  user_id: number;
  name: string;
  expiration_date?: string;
}

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
}

router.get('/recipes', async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const recipes = await db.all<Recipe[]>('SELECT * FROM recipes');
  for (const recipe of recipes) {
    const images = await db.all('SELECT path FROM recipe_images WHERE recipe_id = ?', [recipe.id]);
    (recipe as any).images = images.map(img => `/uploads/${path.basename(img.path)}`);
  }
  res.json(recipes);
});

router.use('/uploads', express.static('uploads')); 

router.post('/recipes', authenticate, upload.array('images', 5), async (req: Request, res: Response) => {
  const { name, category, ingredients, instructions, dietary_info, prep_time, cook_time } = req.body;
  const files = req.files as Express.Multer.File[];
  const db = await initializeDatabase();
  const result = await db.run(
    'INSERT INTO recipes (user_id, name, category, ingredients, instructions, dietary_info, prep_time, cook_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user!.id, name, category, ingredients, instructions, dietary_info, prep_time, cook_time]
  );
  const recipeId = result.lastID;
  if (files) {
    for (const file of files) {
      await db.run('INSERT INTO recipe_images (recipe_id, path) VALUES (?, ?)', [recipeId, file.path]);
    }
  }
  res.status(201).json({ id: recipeId });
});

router.get('/suggested-recipes', authenticate, async (req: Request, res: Response) => {
  const db = await initializeDatabase();
  const ingredients = await db.all<Ingredient[]>('SELECT name, expiration_date FROM ingredients WHERE user_id = ?', [req.user!.id]);
  const userIngredients = ingredients.map(i => i.name.toLowerCase());

  const allRecipes = await db.all<Recipe[]>('SELECT * FROM recipes');
  const suggested = allRecipes
    .filter(recipe => {
      const recipeIngredients = recipe.ingredients.toLowerCase().split(', ');
      return recipeIngredients.some(ri => userIngredients.includes(ri));
    })
    .sort((a, b) => {
      const aExpiring = ingredients.some(i => i.expiration_date && new Date(i.expiration_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      const bExpiring = ingredients.some(i => i.expiration_date && new Date(i.expiration_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      return aExpiring === bExpiring ? 0 : aExpiring ? -1 : 1;
    });

  res.json(suggested);
});

export default router;
