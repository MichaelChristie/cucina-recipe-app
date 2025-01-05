import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Define types
interface Ingredient {
  id: string;
  name: string;
  defaultAmount: number;
  defaultUnit: string;
  category?: string;
}

interface Step {
  order: number;
  instruction: string;
}

// Function to fetch all ingredients from Firestore
const fetchIngredientsFromFirestore = async (db: admin.firestore.Firestore): Promise<Ingredient[]> => {
  const ingredientsSnapshot = await db.collection('ingredients').get();
  return ingredientsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Ingredient[];
};

// Get random ingredients from Firestore
const getRandomIngredients = async (db: admin.firestore.Firestore) => {
  try {
    const allIngredients = await fetchIngredientsFromFirestore(db);
    
    if (!allIngredients.length) {
      console.error('No ingredients found in database');
      return [];
    }

    const numIngredients = Math.floor(Math.random() * 5) + 4; // 4-8 ingredients
    const selectedIngredients = [];
    const usedIndexes = new Set();

    while (selectedIngredients.length < numIngredients && selectedIngredients.length < allIngredients.length) {
      const randomIndex = Math.floor(Math.random() * allIngredients.length);
      if (!usedIndexes.has(randomIndex)) {
        usedIndexes.add(randomIndex);
        const ingredient = allIngredients[randomIndex];
        selectedIngredients.push({
          id: ingredient.id,
          name: ingredient.name,
          amount: Number((ingredient.defaultAmount * (0.5 + Math.random())).toFixed(2)),
          unit: ingredient.defaultUnit
        });
      }
    }
    return selectedIngredients;
  } catch (error) {
    console.error('Error getting ingredients:', error);
    return [];
  }
};

// Generate random lorem ipsum steps
const generateSteps = (): Step[] => {
  const steps = [];
  for (let i = 0; i < 8; i++) {
    steps.push({
      order: i + 1,
      instruction: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    });
  }
  return steps;
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
let serviceAccount;
try {
  // Try to read from environment variable first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // Use the existing service account file
    const serviceAccountPath = path.join(__dirname, '..', 'config', 'cucina-recipe-app-firebase-adminsdk-70386-7ca86b4daf.json');
    serviceAccount = require(serviceAccountPath);
  }
} catch (error) {
  console.error('Error loading service account:', error);
  process.exit(1);
}

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
      
      // Only update if ingredients or steps are missing or invalid
      const updates: any = {};
      
      // Ensure steps array exists and has valid descriptions
      const hasValidSteps = recipeData.steps && 
                           Array.isArray(recipeData.steps) && 
                           recipeData.steps.length > 0 && 
                           recipeData.steps.every(step => step && 
                           typeof step.instruction === 'string' && 
                           step.instruction.trim().length > 0 &&
                           typeof step.order === 'number');
                           
      if (!hasValidSteps) {
        updates.steps = generateSteps();
      }
      
      // Ensure ingredients array exists and has valid data
      const hasValidIngredients = recipeData.ingredients && 
                                 Array.isArray(recipeData.ingredients) && 
                                 recipeData.ingredients.length > 0 && 
                                 recipeData.ingredients.every(ing => 
                                   ing && 
                                   typeof ing.name === 'string' && 
                                   ing.name.trim().length > 0 &&
                                   typeof ing.amount === 'number' &&
                                   typeof ing.unit === 'string'
                                 );

      if (!hasValidIngredients) {
        updates.ingredients = await getRandomIngredients(db);
        
        // Skip if no ingredients could be fetched
        if (!updates.ingredients.length) {
          console.log(`Skipped recipe ${recipeDoc.id}: Could not fetch ingredients`);
          continue;
        }
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        try {
          await db.collection('recipes').doc(recipeDoc.id).update(updates);
          console.log(`Updated recipe: ${recipeDoc.id}`, updates);
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