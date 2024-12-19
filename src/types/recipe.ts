export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: (EditorIngredient | IngredientDivider)[];
  steps: { text: string }[];
  cookTime?: number;
  prepTime?: number;
  servings: number;
  difficulty?: string;
  calories?: number;
  image?: string;
  imageCaption?: string;
  tags?: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface IngredientDivider {
  id: string;
  type: 'divider';
  label: string;
} 