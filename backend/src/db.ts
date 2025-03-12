import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

// Function to initialize the database and create necessary tables

export async function initializeDatabase() {
  const db = await open({
    filename: './zero_waste_chef.db', //databse file
    driver: sqlite3.Database, //SQLite driver
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

  // Migration: Add role column if it doesn't exist
  const usersTableInfo = await db.all("PRAGMA table_info(users)");
  const hasRoleColumn = usersTableInfo.some((column: any) => column.name === 'role');
  if (!hasRoleColumn) {
    console.log('Adding role column to users table...');
    await db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
    await db.exec(`UPDATE users SET role = 'user' WHERE role IS NULL`);
  }

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
  // Create likes table

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
  // Create recipe_image table

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

// Function to seed an admin user into the database
export async function seedAdminUser() {
  const db = await initializeDatabase();

  // Check if admin user already exists
  const existingAdmin = await db.get('SELECT * FROM users WHERE username = ?', ['useradmin']);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('NewUser012@', 10); // Hash the admin password
    await db.run(
      `INSERT INTO users (username, email, password, name, family_name, profession, age, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'useradmin',
        'adminuser@example.com',
        hashedPassword,
        'admin',
        'kazu',
        'jobless',
        20,
        'admin'
      ]
    );
    console.log('Admin user "useradmin" created successfully.');
  } else {
    console.log('Admin user "useradmin" already exists.');
  }
}

// Call this function after initialization
initializeDatabase().then(() => {
  seedAdminUser().catch(console.error);
});

