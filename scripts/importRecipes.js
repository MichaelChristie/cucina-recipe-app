//npm run import-recipes
// Put recipes in sample_recipes.json

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

const app = initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore(app);

async function importRecipes() {
  try {
    // Read JSON file
    const jsonData = await fs.promises.readFile('./sample_recipes.json', { encoding: 'utf8' });
    if (!jsonData) {
      throw new Error('No data read from file');
    }
    const recipes = JSON.parse(jsonData);

    // Ensure recipes is an array
    const recipesArray = Array.isArray(recipes) ? recipes : [recipes];

    // Process each recipe
    for (const recipe of recipesArray) {
      // Add to Firestore
      const recipeData = {
        ...recipe,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Remove the id field if it exists
      delete recipeData.id;

      await db.collection('recipes').add(recipeData);
      console.log(`Imported recipe: ${recipe.name}`);
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing recipes:', error.message);
    process.exit(1);
  }
}

// Run the import
importRecipes(); 