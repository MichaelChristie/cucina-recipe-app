import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config(); // Load environment variables

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
  require('../config/cucina-recipe-app-firebase-adminsdk-70386-7ca86b4daf.json')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const ingredients = [
  { name: 'All-purpose flour', category: 'Baking', defaultUnit: 'g' },
  { name: 'Sugar', category: 'Baking', defaultUnit: 'g' },
  { name: 'Salt', category: 'Seasonings', defaultUnit: 'g' },
  { name: 'Black pepper', category: 'Seasonings', defaultUnit: 'g' },
  { name: 'Olive oil', category: 'Oils', defaultUnit: 'ml' },
  { name: 'Eggs', category: 'Dairy & Eggs', defaultUnit: 'whole' },
  { name: 'Milk', category: 'Dairy & Eggs', defaultUnit: 'ml' },
  { name: 'Butter', category: 'Dairy & Eggs', defaultUnit: 'g' },
  { name: 'Onion', category: 'Vegetables', defaultUnit: 'whole' },
  { name: 'Garlic', category: 'Vegetables', defaultUnit: 'clove' },
  { name: 'Tomatoes', category: 'Vegetables', defaultUnit: 'whole' },
  { name: 'Carrots', category: 'Vegetables', defaultUnit: 'whole' },
  { name: 'Potatoes', category: 'Vegetables', defaultUnit: 'whole' },
  { name: 'Rice', category: 'Grains', defaultUnit: 'g' },
  { name: 'Pasta', category: 'Grains', defaultUnit: 'g' },
  { name: 'Chicken breast', category: 'Meat', defaultUnit: 'g' },
  { name: 'Ground beef', category: 'Meat', defaultUnit: 'g' },
  { name: 'Parmesan cheese', category: 'Dairy & Eggs', defaultUnit: 'g' },
  { name: 'Heavy cream', category: 'Dairy & Eggs', defaultUnit: 'ml' },
  { name: 'Soy sauce', category: 'Condiments', defaultUnit: 'ml' }
];

async function clearIngredients() {
  const snapshot = await db.collection('ingredients').get();
  const batch = db.batch();
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('Cleared existing ingredients');
}

async function importIngredients() {
  try {
    console.log('Starting ingredient import...');
    
    // Uncomment the next line if you want to clear existing ingredients
    // await clearIngredients();
    
    for (const ingredient of ingredients) {
      await db.collection('ingredients').add({
        name: ingredient.name,
        category: ingredient.category,
        defaultUnit: ingredient.defaultUnit,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added ingredient: ${ingredient.name}`);
    }
    
    console.log('Ingredient import completed successfully!');
  } catch (error) {
    console.error('Error importing ingredients:', error);
  } finally {
    process.exit();
  }
}

importIngredients(); 