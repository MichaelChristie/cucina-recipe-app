export interface StickyFooterProps {
  onSave: (e: React.MouseEvent) => void;
  onClose: (e: React.MouseEvent) => void;
  saving: boolean;
  recipeId?: string;
} 