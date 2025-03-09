import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initializeDatabase() {
  const db = await open({
    filename: './zero_waste_chef.db',
    driver: sqlite3.Database,
  });

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      family_name TEXT NOT NULL,
      phone_number TEXT,
      profession TEXT,
      age INTEGER,
      role TEXT DEFAULT 'user'
    )
  `);

  // Create Recipes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      dietary_info TEXT,
      prep_time INTEGER,
      cook_time INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Migration: Add created_at column if it doesn't exist
  const recipesTableInfo = await db.all("PRAGMA table_info(recipes)");
  const hasCreatedAtColumn = recipesTableInfo.some((column: any) => column.name === 'created_at');
  if (!hasCreatedAtColumn) {
    console.log('Adding created_at column to recipes table...');
    await db.exec('ALTER TABLE recipes ADD COLUMN created_at TEXT');
    await db.exec(`UPDATE recipes SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`);
  } else {
    // Ensure no NULL values exist in created_at
    await db.exec(`UPDATE recipes SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`);
  }

  // Create Ingredients table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      expiration_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create Comments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      recipe_id INTEGER,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      recipe_id INTEGER,
      is_like BOOLEAN NOT NULL,
      UNIQUE(user_id, recipe_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS recipe_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER,
      path TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    )
  `);

  return db;
}
