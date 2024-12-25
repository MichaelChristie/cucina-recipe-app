import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Sample ingredients for random selection
const sampleIngredients = [
  { name: 'All-purpose Flour', amount: 2, unit: 'cups' },
  { name: 'Granulated Sugar', amount: 1, unit: 'cup' },
  { name: 'Cocoa Powder', amount: 0.5, unit: 'cup' },
  { name: 'Baking Powder', amount: 2, unit: 'tsp' },
  { name: 'Salt', amount: 0.5, unit: 'tsp' },
  { name: 'Milk', amount: 1, unit: 'cup' },
  { name: 'Eggs', amount: 2, unit: 'whole' },
  { name: 'Vanilla Extract', amount: 1, unit: 'tsp' },
  { name: 'Butter', amount: 0.5, unit: 'cup' },
  { name: 'Heavy Cream', amount: 1, unit: 'cup' },
  { name: 'Brown Sugar', amount: 0.75, unit: 'cup' },
  { name: 'Vegetable Oil', amount: 0.3, unit: 'cup' },
];

// Generate random lorem ipsum steps
const generateSteps = () => {
  const steps = [];
  for (let i = 0; i < 8; i++) {
    steps.push({
      step: i + 1,
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    });
  }
  return steps;
};

// Get random ingredients
const getRandomIngredients = () => {
  const numIngredients = Math.floor(Math.random() * 5) + 4; // 4-8 ingredients
  const selectedIngredients = [];
  const usedIndexes = new Set();

  while (selectedIngredients.length < numIngredients) {
    const randomIndex = Math.floor(Math.random() * sampleIngredients.length);
    if (!usedIndexes.has(randomIndex)) {
      usedIndexes.add(randomIndex);
      const ingredient = { ...sampleIngredients[randomIndex] };
      // Randomize the amount a bit
      ingredient.amount = Number((ingredient.amount * (0.5 + Math.random())).toFixed(2));
      selectedIngredients.push(ingredient);
    }
  }
  return selectedIngredients;
};

const backupData = async (recipes: any[]) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = {
    timestamp,
    recipes: recipes.map(recipe => ({ id: recipe.id, ...recipe.data() }))
  };

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  fs.writeFileSync(
    path.join(backupDir, `recipes-backup-${timestamp}.json`),
    JSON.stringify(backup, null, 2)
  );
  console.log(`Backup created: recipes-backup-${timestamp}.json`);
};

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const updateRecipes = async () => {
  try {
    // Get all recipes
    const recipesSnapshot = await db.collection('recipes').get();
    const recipes = recipesSnapshot.docs;

    // Create backup
    await backupData(recipes);

    console.log(`Found ${recipes.length} recipes to update`);

    // Update each recipe
    for (const recipeDoc of recipes) {
      const recipeData = recipeDoc.data();
      
      // Only update if ingredients or steps are missing
      const updates: any = {};
      
      // Ensure steps array exists and has valid descriptions
      if (!recipeData.steps || !Array.isArray(recipeData.steps) || recipeData.steps.length === 0 || 
          !recipeData.steps.every(step => step && typeof step.description === 'string')) {
        updates.steps = generateSteps();
      }
      
      // Ensure ingredients array exists and has valid data
      if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0 ||
          !recipeData.ingredients.every(ing => ing && typeof ing.name === 'string')) {
        updates.ingredients = getRandomIngredients();
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        try {
          await db.collection('recipes').doc(recipeDoc.id).update(updates);
          console.log(`Updated recipe: ${recipeDoc.id}`);
        } catch (error) {
          console.error(`Error updating recipe ${recipeDoc.id}:`, error);
        }
      } else {
        console.log(`Skipped recipe: ${recipeDoc.id} (already has valid ingredients and steps)`);
      }
    }

    console.log('Update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating recipes:', error);
    process.exit(1);
  }
};

// Run the update
updateRecipes(); 