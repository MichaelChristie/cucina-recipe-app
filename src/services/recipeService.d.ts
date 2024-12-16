import { Recipe } from '../types';

export interface RecipeWithId extends Recipe {
  id: string;
}

export function getRecipes(): Promise<RecipeWithId[]>;
export function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<{ id: string }>;
export function updateRecipe(id: string, recipe: Partial<Recipe>): Promise<void>;
export function deleteRecipe(id: string): Promise<void>;
export function getRecipeById(id: string): Promise<RecipeWithId>; 