export interface EditorRecipe {
  // ... other properties
  ingredients: EditorIngredient[];  // Not optional, always an array
  // ... other properties
}

export interface EditorIngredient {
  id: string;  // Make sure this exists
  name: string;
  amount: number | string;
  unit: string;
  ingredientId: string;
  confirmed: boolean;
} 