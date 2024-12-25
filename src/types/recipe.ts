export interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageCaption?: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  servings?: number;
  tags?: string[];
  ingredients?: Array<{
    ingredientId: string;
    amount: number;
    unit: string;
  } | {
    type: 'divider';
    label: string;
  }>;
  steps?: RecipeStep[];
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
  featured?: boolean;
  shortDescription?: string;
}

export interface RecipeStep {
  step: number;
  description: string;
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