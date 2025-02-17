import { VideoMetadata } from './shared';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  imageCaption?: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings?: number;
  tags: string[];
  ingredients: Array<RecipeIngredient | IngredientDivider>;
  steps: Step[];
  position?: number;
  createdAt: Date;
  updatedAt: Date;
  featured?: boolean;
  shortDescription?: string;
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
  order: number;
  instruction: string;
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
  id?: string;
}

export const isIngredientDivider = (
  ingredient: RecipeIngredient | IngredientDivider
): ingredient is IngredientDivider => {
  return 'type' in ingredient && ingredient.type === 'divider';
}; 