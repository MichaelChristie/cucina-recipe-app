export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  imageCaption?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  calories?: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: (string | { text: string })[];
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: number;
  unit: string;
}

export interface Tag {
  id: string;
  name: string;
  emoji: string;
  category: 'special' | 'style' | 'cuisine' | 'meal' | 'diet';
}

export interface Ingredient {
  id: string;
  name: string;
  defaultUnit: string;
} 