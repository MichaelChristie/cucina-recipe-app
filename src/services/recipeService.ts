import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  getDoc,
  writeBatch,
  limit,
  setDoc,
  QueryDocumentSnapshot,
  DocumentReference,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Recipe } from '../types';
import { getTags } from './tagService';
import { backupService } from './backupService';

const COLLECTION_NAME = 'recipes';
const INGREDIENTS_COLLECTION = 'ingredients';

// Helper function to ensure consistent recipe ordering
const orderRecipesByPosition = (recipes: Recipe[]): Recipe[] => {
  return recipes.sort((a, b) => {
    const posA = a.position || Number.MAX_VALUE;
    const posB = b.position || Number.MAX_VALUE;
    return posA - posB;
  });
};

// Debug function to check ingredients
const logAvailableIngredients = async () => {
  const snapshot = await getDocs(collection(db, INGREDIENTS_COLLECTION));
  console.log('Available ingredients:', snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })));
};

// Get random ingredients for recipe generation
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

// Helper function to convert Firestore timestamps
const convertTimestamps = (data: any) => {
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  };
};

export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const recipesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(recipesQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    } as Recipe));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const recipeRef: DocumentReference = doc(db, COLLECTION_NAME, id);
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      return null;
    }
    
    const data = recipeDoc.data();
    return {
      id: recipeDoc.id,
      ...convertTimestamps(data)
    } as Recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

export const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...recipe,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>): Promise<void> => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recipeRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id: string): Promise<void> => {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(recipeRef);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const reorderAllRecipes = async (): Promise<void> => {
  const recipesRef = collection(db, COLLECTION_NAME);
  const q = query(recipesRef, orderBy('position', 'asc'));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc, index) => {
    batch.update(doc.ref, { position: index + 1 });
  });
  
  await batch.commit();
};

export const cleanupInactiveTags = async (): Promise<{ updated: number, total: number }> => {
  const [recipes, allTags] = await Promise.all([
    getRecipes(),
    getTags()
  ]);
  
  const activeTags = allTags.filter(tag => tag.active).map(tag => String(tag.id));
  let updatedCount = 0;
  
  const batch = writeBatch(db);
  
  recipes.forEach(recipe => {
    if (!recipe.tags) return;
    
    const filteredTags = recipe.tags.filter(tagId => activeTags.includes(String(tagId)));
    
    // Only update if tags have changed
    if (filteredTags.length !== recipe.tags.length) {
      const recipeRef = doc(db, COLLECTION_NAME, recipe.id);
      batch.update(recipeRef, { tags: filteredTags });
      updatedCount++;
    }
  });
  
  await batch.commit();
  
  return {
    updated: updatedCount,
    total: recipes.length
  };
};

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
        
        if (!recipeData.ingredients?.length || !recipeData.steps?.length) {
          const ingredients = await getRandomIngredients(8);
          console.log(`Generated ingredients for recipe ${recipeDoc.id}:`, ingredients);

          const steps = generateDetailedSteps();
          
          const updatedRecipe = {
            ...recipeData,
            ingredients,
            steps,
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