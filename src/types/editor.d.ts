import { Recipe, Tag, Ingredient } from './admin';

export interface EditorIngredient extends Omit<Ingredient, 'id'> {
  id?: string;
  name: string;
  amount: number | '';
  unit: string;
  ingredientId: string;
  confirmed?: boolean;
}

export interface EditorStep {
  text: string;
  confirmed?: boolean;
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
  onSave: (e: React.MouseEvent) => Promise<void>;
  onClose: (e: React.MouseEvent) => Promise<void>;
  saving: boolean;
}

export interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ingredient: Omit<Ingredient, 'id'>) => Promise<Ingredient>;
  initialName?: string;
} 