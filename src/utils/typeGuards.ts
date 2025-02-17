import { Recipe, Difficulty, RecipeIngredient, IngredientDivider } from '../types/recipe';

export const isValidRecipe = (recipe: unknown): recipe is Recipe => {
  if (!recipe || typeof recipe !== 'object') return false;
  
  const r = recipe as any;
  
  return (
    typeof r.id === 'string' &&
    typeof r.title === 'string' &&
    typeof r.description === 'string' &&
    typeof r.image === 'string' &&
    typeof r.prepTime === 'string' &&
    typeof r.cookTime === 'string' &&
    Array.isArray(r.ingredients) &&
    Array.isArray(r.steps) &&
    Array.isArray(r.tags) &&
    typeof r.servings === 'number' &&
    typeof r.featured === 'boolean' &&
    typeof r.difficulty === 'string' &&
    ['easy', 'medium', 'hard', 'expert'].includes(r.difficulty) &&
    typeof r.nutrition === 'object'
  );
};

export const isIngredientDivider = (ingredient: RecipeIngredient | IngredientDivider): ingredient is IngredientDivider => {
  return 'type' in ingredient && ingredient.type === 'divider';
};

export const asRecipe = (data: unknown): Recipe => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid recipe data');
  }

  const recipe = data as any;
  return {
    id: recipe.id || '',
    title: recipe.title || '',
    description: recipe.description || '',
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    tags: recipe.tags || [],
    position: recipe.position || 0,
    image: recipe.image || '',
    prepTime: String(recipe.prepTime || '0'),
    cookTime: String(recipe.cookTime || '0'),
    difficulty: recipe.difficulty || 'easy',
    servings: recipe.servings || 0,
    featured: recipe.featured || false,
    nutrition: recipe.nutrition || { calories: '0' },
    createdAt: recipe.createdAt || new Date(),
    updatedAt: recipe.updatedAt || new Date(),
    authorId: recipe.authorId || '',
    video: recipe.video || null
  };
}; 