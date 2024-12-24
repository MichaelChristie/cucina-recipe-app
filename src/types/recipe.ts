export interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageCaption?: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  tags?: string[];
  ingredients: (RecipeIngredient | IngredientDivider)[];
  steps: (string | RecipeStep)[];
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
  featured?: boolean;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  amount: number;
  unit: string;
}

export interface IngredientDivider {
  type: 'divider';
  label: string;
}

export interface RecipeStep {
  text: string;
  note?: string;
} 