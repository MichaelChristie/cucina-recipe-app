export interface EditorStep {
  order: number;
  instruction: string;
}

export interface EditorRecipe extends Omit<Recipe, 'ingredients' | 'steps'> {
  ingredients: EditorIngredient[];
  steps: EditorStep[];
  showTagsPanel?: boolean;
  nutrition: {
    calories: string | number;
    protein?: string | number;
    carbs?: string | number;
    fat?: string | number;
  };
}

export interface StickyFooterProps {
  onSave: (e: React.MouseEvent) => void;
  onClose: (e: React.MouseEvent) => void;
  saving: boolean;
  recipeId?: string;
} 