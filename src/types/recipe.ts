export interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string | { url: string } | null;
  imageUrl?: string;
  cookingTime?: number;
  servings?: number;
  tags?: string[];
  // ... other fields
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