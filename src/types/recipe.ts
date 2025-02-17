import { VideoMetadata } from './shared';
import { Timestamp } from 'firebase/firestore';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  image: string;
  imageCaption?: string;
  prepTime: string;
  cookTime: string;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
  ingredients: Array<RecipeIngredient | IngredientDivider>;
  steps: Step[];
  position?: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  featured: boolean;
  video: VideoMetadata | null;
  authorId: string;
  nutrition: {
    calories: string | number;
    protein?: string | number;
    carbs?: string | number;
    fat?: string | number;
  };
}

export interface Step {
  id?: string;
  order: number;
  instruction: string;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  amount: number | '';
  unit: string;
  name: string;
  defaultUnit: string;
  confirmed?: boolean;
}

export interface IngredientDivider {
  id: string;
  type: 'divider';
  label: string;
}

export const isIngredientDivider = (
  ingredient: RecipeIngredient | IngredientDivider
): ingredient is IngredientDivider => {
  return 'type' in ingredient && ingredient.type === 'divider';
};

// Type guard for RecipeIngredient
export const isRecipeIngredient = (
  ingredient: RecipeIngredient | IngredientDivider
): ingredient is RecipeIngredient => {
  return !('type' in ingredient);
}; 