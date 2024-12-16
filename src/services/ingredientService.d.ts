import { Ingredient } from '../types/admin';

export function getIngredients(): Promise<Ingredient[]>;
export function addIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<{ id: string }>;
export function updateIngredient(id: string, ingredient: Partial<Ingredient>): Promise<void>;
export function deleteIngredient(id: string): Promise<void>;
export function removeDuplicateIngredients(): Promise<void>; 