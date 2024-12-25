import { Timestamp } from 'firebase/firestore';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export interface Tag {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  defaultAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngredientInRecipe {
  ingredientId: string;
  amount: number;
  unit: string;
}

export interface RecipeStep {
  text: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  imageCaption?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  tags: string[];
  ingredients: Array<{
    ingredientId: string;
    amount: number;
    unit: string;
  } | {
    type: 'divider';
    label: string;
  }>;
  steps: Array<{
    description: string;
  }>;
}

interface EditorRecipe {
  id?: string;
  title: string;
  description: string;
  ingredients: Array<{
    id: string;
    name: string;
    amount: number | string;
    unit: string;
    ingredientId: string;
    confirmed?: boolean;
  }>;
  steps: Array<{
    step: number;
    description: string;
  }>;
  cookTime?: number;
  prepTime?: number;
  servings?: number;
  difficulty?: string;
  tags?: string[];
  image?: string;
  imageCaption?: string;
} 