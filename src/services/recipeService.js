import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, setDoc, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { backupService } from './backupService';

const COLLECTION_NAME = 'recipes';
const INGREDIENTS_COLLECTION = 'ingredients';

// Debug function to check ingredients
const logAvailableIngredients = async () => {
  const snapshot = await getDocs(collection(db, INGREDIENTS_COLLECTION));
  console.log('Available ingredients:', snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })));
};

// Modified getRandomIngredients function with better error handling
const getRandomIngredients = async (count = 8) => {
  try {
    const ingredientsSnapshot = await getDocs(collection(db, INGREDIENTS_COLLECTION));
    
    if (ingredientsSnapshot.empty) {
      console.error('No ingredients found in database');
      return defaultIngredients;
    }

    const allIngredients = ingredientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Found ingredients:', allIngredients);
    
    // Ensure consistent data structure for frontend
    const shuffled = [...allIngredients].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length)).map(ingredient => ({
      id: ingredient.id,
      ingredientId: ingredient.id,
      name: ingredient.name || 'Unknown Ingredient',
      amount: Math.floor(Math.random() * 4) + 1,
      unit: ingredient.defaultUnit || 'pieces',
      defaultUnit: ingredient.defaultUnit || 'pieces'
    }));
  } catch (error) {
    console.error('Error getting ingredients:', error);
    return defaultIngredients;
  }
};

// Fallback ingredients in case of database error
const defaultIngredients = [
  { ingredientId: 'default1', name: 'All-purpose flour', amount: 2, unit: 'cups' },
  { ingredientId: 'default2', name: 'Sugar', amount: 1, unit: 'cup' },
  { ingredientId: 'default3', name: 'Butter', amount: 200, unit: 'g' },
  { ingredientId: 'default4', name: 'Eggs', amount: 2, unit: 'pieces' },
  { ingredientId: 'default5', name: 'Milk', amount: 1, unit: 'cup' },
  { ingredientId: 'default6', name: 'Vanilla Extract', amount: 1, unit: 'tsp' },
  { ingredientId: 'default7', name: 'Baking Powder', amount: 2, unit: 'tsp' },
  { ingredientId: 'default8', name: 'Salt', amount: 1, unit: 'pinch' }
];

const generateDetailedSteps = () => {
  const loremSentences = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit.',
    'At vero eos et accusamus et iusto odio dignissimos ducimus qui.',
    'Similique sunt in culpa qui officia deserunt mollitia animi.',
    'Nam libero tempore, cum soluta nobis est eligendi optio cumque.',
    'Temporibus autem quibusdam et aut officiis debitis aut rerum.',
    'Itaque earum rerum hic tenetur a sapiente delectus, ut aut.',
    'Et harum quidem rerum facilis est et expedita distinctio.'
  ];

  return Array.from({ length: 8 }, (_, index) => {
    // Get two random, different sentences
    const shuffled = [...loremSentences].sort(() => 0.5 - Math.random());
    const stepText = `${shuffled[0]} ${shuffled[1]}`;
    
    return {
      id: `step-${index + 1}`,
      order: index + 1,
      description: stepText,
      markdown: stepText,
      content: stepText,
      text: stepText
    };
  });
};

// Create a new recipe
export const addRecipe = async (recipeData) => {
  try {
    // Validate required fields
    const validatedData = {
      title: recipeData.title || '',
      description: recipeData.description || '',
      image: recipeData.image || '',
      prepTime: recipeData.prepTime || '',
      cookTime: recipeData.cookTime || '',
      difficulty: recipeData.difficulty || 'medium',
      servings: recipeData.servings || '',
      calories: recipeData.calories || '',
      category: recipeData.category || '',
      nutrition: recipeData.nutrition || {
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      },
      steps: recipeData.steps || [],
      tags: recipeData.tags || [],
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), validatedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

// Get a single recipe by ID
export const getRecipeById = async (recipeId) => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, recipeId);
    const recipeSnap = await getDoc(recipeRef);
    
    if (!recipeSnap.exists()) {
      throw new Error('Recipe not found');
    }
    
    const recipeData = {
      id: recipeSnap.id,
      ...recipeSnap.data(),
      tags: recipeSnap.data().tags || []
    };
    
    console.log('Recipe data being sent to frontend:', recipeData);
    console.log('Ingredients:', recipeData.ingredients);
    console.log('Steps:', recipeData.steps);
    
    return recipeData;
  } catch (error) {
    console.error('Error getting recipe:', error);
    throw error;
  }
};

// Read all recipes
export const getRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const recipes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      tags: doc.data().tags || []
    }));
    
    console.log('All recipes being sent to frontend:', recipes);
    return recipes;
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};

// Update a recipe
export const updateRecipe = async (recipeId, updatedData) => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, recipeId);
    // Clean the data before saving
    const cleanData = {
      ...updatedData,
      servings: updatedData.servings || '',
      calories: updatedData.calories || '',
      tags: updatedData.tags || [],
      nutrition: updatedData.nutrition || { calories: '' },
      ingredients: updatedData.ingredients || [],
      steps: updatedData.steps || []
    };
    
    await updateDoc(recipeRef, cleanData);
    return { id: recipeId, ...cleanData };
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

// Delete a recipe
export const deleteRecipe = async (recipeId) => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, recipeId);
    await deleteDoc(recipeRef);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// Modified restore function with better error handling and logging
export const restoreRecipeData = async () => {
  try {
    await backupService.createBackup();
    console.log('Backup created successfully');

    await logAvailableIngredients();

    const recipesSnapshot = await getDocs(collection(db, 'recipes'));
    console.log(`Found ${recipesSnapshot.size} recipes to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const recipeDoc of recipesSnapshot.docs) {
      try {
        const recipeData = recipeDoc.data();
        
        if (recipeDoc.id === 'Zphw6jXsgVpUiCqW2kFo') {
          skippedCount++;
          continue;
        }

        // Check for missing or invalid data
        if (!recipeData.ingredients?.length || !recipeData.steps?.length) {
          const ingredients = await getRandomIngredients(8);
          console.log(`Generated ingredients for recipe ${recipeDoc.id}:`, ingredients);

          const steps = generateDetailedSteps();
          
          // Ensure all required fields are present
          const updatedRecipe = {
            ...recipeData,
            ingredients,
            steps: generateDetailedSteps().map(step => ({
              ...step,
              description: step.description,
              markdown: step.description,
              content: step.description
            })),
            title: recipeData.title || 'Untitled Recipe',
            description: recipeData.description || '',
            prepTime: recipeData.prepTime || '30',
            cookTime: recipeData.cookTime || '30',
            difficulty: recipeData.difficulty || 'medium',
            servings: recipeData.servings || '4',
            calories: recipeData.calories || '',
            category: recipeData.category || 'other',
            tags: recipeData.tags || [],
            nutrition: recipeData.nutrition || {
              calories: '',
              protein: '',
              carbs: '',
              fat: ''
            }
          };

          await setDoc(doc(db, 'recipes', recipeDoc.id), updatedRecipe, { merge: true });
          console.log(`Updated recipe structure:`, updatedRecipe);

          updatedCount++;
          console.log(`Updated recipe ${recipeDoc.id} successfully`);
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error processing recipe ${recipeDoc.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Recipe restoration complete:
      - Updated: ${updatedCount} recipes
      - Skipped: ${skippedCount} recipes
      - Errors: ${errorCount} recipes`);

    return {
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Error in restoreRecipeData:', error);
    throw error;
  }
}; 