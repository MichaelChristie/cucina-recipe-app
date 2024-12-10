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
  // Baking & Dry Goods
  { name: 'All-purpose flour', category: 'Baking', defaultUnit: 'g', defaultAmount: 120 },
  { name: 'High grade flour', category: 'Baking', defaultUnit: 'g', defaultAmount: 500 }, 
  { name: 'Bread flour', category: 'Baking', defaultUnit: 'g', defaultAmount: 120 },
  { name: 'Cake flour', category: 'Baking', defaultUnit: 'g', defaultAmount: 120 },
  { name: 'Whole wheat flour', category: 'Baking', defaultUnit: 'g', defaultAmount: 120 },
  { name: 'Granulated sugar', category: 'Baking', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Brown sugar', category: 'Baking', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Powdered sugar', category: 'Baking', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Baking powder', category: 'Baking', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Baking soda', category: 'Baking', defaultUnit: 'tsp', defaultAmount: 0.5 },
  { name: 'Active dry yeast', category: 'Baking', defaultUnit: 'g', defaultAmount: 7 },
  { name: 'Cornstarch', category: 'Baking', defaultUnit: 'g', defaultAmount: 15 },
  { name: 'Vanilla extract', category: 'Baking', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Cocoa powder', category: 'Baking', defaultUnit: 'g', defaultAmount: 30 },
  { name: 'Chocolate chips', category: 'Baking', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Almond flour', category: 'Baking', defaultUnit: 'g', defaultAmount: 120 },

  // Dairy & Eggs
  { name: 'Whole milk', category: 'Dairy & Eggs', defaultUnit: 'ml', defaultAmount: 250 },
  { name: 'Heavy cream', category: 'Dairy & Eggs', defaultUnit: 'ml', defaultAmount: 100 },
  { name: 'Butter', category: 'Dairy & Eggs', defaultUnit: 'g', defaultAmount: 115 },
  { name: 'Eggs', category: 'Dairy & Eggs', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Parmesan cheese', category: 'Dairy & Eggs', defaultUnit: 'g', defaultAmount: 30 },
  { name: 'Cheddar cheese', category: 'Dairy & Eggs', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Mozzarella cheese', category: 'Dairy & Eggs', defaultUnit: 'g', defaultAmount: 125 },
  { name: 'Cream cheese', category: 'Dairy & Eggs', defaultUnit: 'g', defaultAmount: 225 },
  { name: 'Greek yogurt', category: 'Dairy & Eggs', defaultUnit: 'g', defaultAmount: 170 },
  { name: 'Sour cream', category: 'Dairy & Eggs', defaultUnit: 'g', defaultAmount: 120 },

  // Meat & Poultry
  { name: 'Chicken breast', category: 'Meat', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Chicken thighs', category: 'Meat', defaultUnit: 'g', defaultAmount: 150 },
  { name: 'Ground beef', category: 'Meat', defaultUnit: 'g', defaultAmount: 250 },
  { name: 'Beef steak', category: 'Meat', defaultUnit: 'g', defaultAmount: 225 },
  { name: 'Pork chops', category: 'Meat', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Bacon', category: 'Meat', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Ground pork', category: 'Meat', defaultUnit: 'g', defaultAmount: 250 },
  { name: 'Ground turkey', category: 'Meat', defaultUnit: 'g', defaultAmount: 250 },

  // Seafood
  { name: 'Salmon fillet', category: 'Seafood', defaultUnit: 'g', defaultAmount: 170 },
  { name: 'Shrimp', category: 'Seafood', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Tuna', category: 'Seafood', defaultUnit: 'g', defaultAmount: 140 },
  { name: 'Cod fillet', category: 'Seafood', defaultUnit: 'g', defaultAmount: 150 },

  // Vegetables
  { name: 'Onion', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Garlic', category: 'Vegetables', defaultUnit: 'clove', defaultAmount: 2 },
  { name: 'Tomatoes', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 2 },
  { name: 'Cherry tomatoes', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 150 },
  { name: 'Carrots', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 2 },
  { name: 'Celery', category: 'Vegetables', defaultUnit: 'stalk', defaultAmount: 2 },
  { name: 'Bell peppers', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Potatoes', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 2 },
  { name: 'Sweet potatoes', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Broccoli', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 250 },
  { name: 'Cauliflower', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 250 },
  { name: 'Spinach', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 150 },
  { name: 'Lettuce', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Mushrooms', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Zucchini', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Cucumber', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Green beans', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Asparagus', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 200 },
  { name: 'Red onion', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Green onions', category: 'Vegetables', defaultUnit: 'whole', defaultAmount: 3 },
  { name: 'Corn', category: 'Vegetables', defaultUnit: 'g', defaultAmount: 150 },

  // Fruits
  { name: 'Lemon', category: 'Fruits', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Lime', category: 'Fruits', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Apple', category: 'Fruits', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Banana', category: 'Fruits', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Orange', category: 'Fruits', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Berries', category: 'Fruits', defaultUnit: 'g', defaultAmount: 150 },
  { name: 'Strawberries', category: 'Fruits', defaultUnit: 'g', defaultAmount: 150 },
  { name: 'Blueberries', category: 'Fruits', defaultUnit: 'g', defaultAmount: 125 },
  { name: 'Raspberries', category: 'Fruits', defaultUnit: 'g', defaultAmount: 125 },
  { name: 'Pear', category: 'Fruits', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Peach', category: 'Fruits', defaultUnit: 'whole', defaultAmount: 1 },

  // Herbs & Spices
  { name: 'Salt', category: 'Seasonings', defaultUnit: 'g', defaultAmount: 5 },
  { name: 'Black pepper', category: 'Seasonings', defaultUnit: 'g', defaultAmount: 2 },
  { name: 'Paprika', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Cumin', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Cinnamon', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Oregano', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Basil', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Thyme', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Rosemary', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Chili powder', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Cayenne pepper', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 0.25 },
  { name: 'Garlic powder', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Onion powder', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Italian seasoning', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 1 },
  { name: 'Bay leaves', category: 'Seasonings', defaultUnit: 'whole', defaultAmount: 1 },
  { name: 'Nutmeg', category: 'Seasonings', defaultUnit: 'tsp', defaultAmount: 0.25 },

  // Oils & Vinegars
  { name: 'Olive oil', category: 'Oils', defaultUnit: 'ml', defaultAmount: 15 },
  { name: 'Vegetable oil', category: 'Oils', defaultUnit: 'ml', defaultAmount: 15 },
  { name: 'Sesame oil', category: 'Oils', defaultUnit: 'ml', defaultAmount: 5 },
  { name: 'Balsamic vinegar', category: 'Oils', defaultUnit: 'ml', defaultAmount: 15 },
  { name: 'Rice vinegar', category: 'Oils', defaultUnit: 'ml', defaultAmount: 15 },
  { name: 'Apple cider vinegar', category: 'Oils', defaultUnit: 'ml', defaultAmount: 15 },

  // Grains & Pasta
  { name: 'White rice', category: 'Grains', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Brown rice', category: 'Grains', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Quinoa', category: 'Grains', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Spaghetti', category: 'Grains', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Penne pasta', category: 'Grains', defaultUnit: 'g', defaultAmount: 100 },
  { name: 'Couscous', category: 'Grains', defaultUnit: 'g', defaultAmount: 100 },

  // Condiments & Sauces
  { name: 'Soy sauce', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 15 },
  { name: 'Worcestershire sauce', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 10 },
  { name: 'Hot sauce', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 5 },
  { name: 'Mustard', category: 'Condiments', defaultUnit: 'g', defaultAmount: 10 },
  { name: 'Mayonnaise', category: 'Condiments', defaultUnit: 'g', defaultAmount: 15 },
  { name: 'Ketchup', category: 'Condiments', defaultUnit: 'g', defaultAmount: 15 },
  { name: 'Honey', category: 'Condiments', defaultUnit: 'g', defaultAmount: 20 },
  { name: 'Maple syrup', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 60 },
  { name: 'Fish sauce', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 10 },
  { name: 'Oyster sauce', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 15 },
  { name: 'Hoisin sauce', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 15 },
  { name: 'Dijon mustard', category: 'Condiments', defaultUnit: 'g', defaultAmount: 10 },
  { name: 'Sriracha sauce', category: 'Condiments', defaultUnit: 'ml', defaultAmount: 10 },

  // Liquids
  { name: 'Water', category: 'Liquids', defaultUnit: 'ml', defaultAmount: 250 },
  { name: 'Stock', category: 'Liquids', defaultUnit: 'ml', defaultAmount: 250 },
  { name: 'Chicken broth', category: 'Liquids', defaultUnit: 'ml', defaultAmount: 250 },
  { name: 'Beef broth', category: 'Liquids', defaultUnit: 'ml', defaultAmount: 250 },
  { name: 'Vegetable broth', category: 'Liquids', defaultUnit: 'ml', defaultAmount: 250 },

  // Nuts & Seeds
  { name: 'Almonds', category: 'Nuts & Seeds', defaultUnit: 'g', defaultAmount: 50 },
  { name: 'Walnuts', category: 'Nuts & Seeds', defaultUnit: 'g', defaultAmount: 50 },
  { name: 'Peanuts', category: 'Nuts & Seeds', defaultUnit: 'g', defaultAmount: 50 },
  { name: 'Sesame seeds', category: 'Nuts & Seeds', defaultUnit: 'g', defaultAmount: 15 },
  { name: 'Chia seeds', category: 'Nuts & Seeds', defaultUnit: 'g', defaultAmount: 15 }
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
    
    await clearIngredients();
    
    for (const ingredient of ingredients) {
      await db.collection('ingredients').add({
        name: ingredient.name,
        category: ingredient.category,
        defaultUnit: ingredient.defaultUnit,
        defaultAmount: ingredient.defaultAmount,
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