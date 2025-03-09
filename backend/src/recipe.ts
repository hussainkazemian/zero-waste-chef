import { initializeDatabase } from './db';

async function seedDatabase() {
  const db = await initializeDatabase();

  const defaultRecipes = [
    {
      user_id: 1,
      name: 'Fried Eggs',
      category: 'Breakfast',
      ingredients: '1-2 eggs, butter or oil, salt, pepper',
      instructions: 'Heat butter or oil in a pan over medium heat. Crack the eggs into the pan, season with salt and pepper, and cook until the whites are set but the yolks are still runny (or to your preference).',
      dietary_info: 'Vegetarian',
      prep_time: 2,
      cook_time: 5,
      created_at: '2023-01-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Omelette',
      category: 'Breakfast',
      ingredients: '2-3 eggs, fillings (cheese, ham, vegetables), salt, pepper, butter',
      instructions: 'Whisk the eggs with salt and pepper. Melt butter in a pan over medium heat, pour in the egg mixture, and let it set slightly. Add fillings to one half, then fold the other half over and cook until set.',
      dietary_info: 'Vegetarian (if no meat)',
      prep_time: 5,
      cook_time: 10,
      created_at: '2023-02-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Vegan Soup',
      category: 'Lunch',
      ingredients: 'Vegetable broth, carrots, celery, onions, potatoes, spices',
      instructions: 'Sauté vegetables, add broth and spices, simmer until tender.',
      dietary_info: 'Vegan, Gluten-free',
      prep_time: 15,
      cook_time: 30,
      created_at: '2023-03-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Vegetable Soup',
      category: 'Lunch, Dinner',
      ingredients: 'Vegetable broth, mixed vegetables (carrots, peas, corn), tomatoes, herbs',
      instructions: 'Cook vegetables in broth, add tomatoes and herbs, simmer until tender.',
      dietary_info: 'Vegetarian, Gluten-free',
      prep_time: 15,
      cook_time: 25,
      created_at: '2023-04-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Spaghetti',
      category: 'Dinner',
      ingredients: 'Spaghetti, tomato sauce, ground meat (optional), garlic, onions, herbs',
      instructions: 'Cook spaghetti, prepare sauce with meat and herbs, combine and serve.',
      dietary_info: 'Can be vegetarian if meat is omitted',
      prep_time: 10,
      cook_time: 20,
      created_at: '2023-05-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Burger',
      category: 'Dinner',
      ingredients: 'Ground beef, buns, lettuce, tomatoes, onions, condiments',
      instructions: 'Form patties, grill, assemble with toppings on buns.',
      dietary_info: 'Can be gluten-free with appropriate buns',
      prep_time: 15,
      cook_time: 15,
      created_at: '2023-06-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Banana Cake',
      category: 'Dessert',
      ingredients: 'Bananas, flour, sugar, eggs, baking powder, vanilla extract',
      instructions: 'Mix ingredients, bake until golden, let cool.',
      dietary_info: 'Vegetarian',
      prep_time: 20,
      cook_time: 40,
      created_at: '2023-07-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Tiramisu',
      category: 'Dessert',
      ingredients: 'Mascarpone cheese, ladyfingers, coffee, rum, sugar, cocoa powder',
      instructions: 'Dip ladyfingers in coffee and rum, layer with mascarpone mixture, dust with cocoa.',
      dietary_info: 'Contains dairy and alcohol',
      prep_time: 30,
      cook_time: 0,
      created_at: '2023-08-01 10:00:00',
    },
    {
      user_id: 1,
      name: 'Fruit Salad',
      category: 'Snack',
      ingredients: 'Mixed fruits (apples, oranges, grapes, berries)',
      instructions: 'Chop fruits, mix, serve chilled.',
      dietary_info: 'Vegan, Gluten-free, Lactose-free',
      prep_time: 10,
      cook_time: 0,
      created_at: '2023-09-01 10:00:00',
    },
  ];

  for (const recipe of defaultRecipes) {
    await db.run(
      'INSERT OR IGNORE INTO recipes (user_id, name, category, ingredients, instructions, dietary_info, prep_time, cook_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [recipe.user_id, recipe.name, recipe.category, recipe.ingredients, recipe.instructions, recipe.dietary_info, recipe.prep_time, recipe.cook_time, recipe.created_at]
    );
  }

  console.log('Database seeded with default recipes');
}

seedDatabase().catch(console.error);
