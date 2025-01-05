import { Recipe } from './recipe';
import { VideoMetadata } from './shared';
import { Ingredient } from './admin';

export interface EditorIngredient {
  id: string;
  name: string;
  amount: number | '';
  unit: string;
  ingredientId: string;
  confirmed?: boolean;
}

export interface EditorStep {
  order: number;
  instruction: string;
}

export interface EditorRecipe extends Omit<Recipe, 'ingredients' | 'steps'> {
  ingredients: Array<EditorIngredient | IngredientDivider>;
  steps: EditorStep[];
  showTagsPanel?: boolean;
  nutrition: {
    calories: string | number;
    protein?: string | number;
    carbs?: string | number;
    fat?: string | number;
  };
  video: VideoMetadata | null;
  featured?: boolean;
}

export interface StickyFooterProps {
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
  saving: boolean;
  recipeId?: string;
}

export interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ingredient: Omit<Ingredient, 'id'>) => Promise<Ingredient>;
  initialName?: string;
}

export interface IngredientDivider {
  id: string;
  type: 'divider';
  label: string;
} 