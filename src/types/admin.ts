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
  id?: string;
  title: string;
  description: string;
  ingredients: IngredientInRecipe[];
  steps: RecipeStep[];
  cookingTime: number;
  prepTime?: number;
  servings: number;
  difficulty?: string;
  calories?: number;
  imageUrl?: string;
  imageCaption?: string;
  tags: string[];
  authorId: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
} 