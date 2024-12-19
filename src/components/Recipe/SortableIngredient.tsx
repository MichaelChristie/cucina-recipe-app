import { FC, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/outline';
import { EditorIngredient, Ingredient } from '../../types';
import { AnimateLayoutChanges, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';

interface SortableIngredientProps {
  ingredient: EditorIngredient;
  index: number;
  onNameChange: (index: number, value: string) => void;
  onAmountChange: (index: number, value: string) => void;
  onUnitChange: (index: number, value: string) => void;
  onConfirmChange: (index: number, value: boolean) => void;
  onRemove: (index: number) => void;
  activeIngredient: { index: number | null; field: keyof EditorIngredient | null };
  setActiveIngredient: (value: { index: number | null; field: keyof EditorIngredient | null }) => void;
  selectedSuggestionIndex: number;
  availableIngredients: Ingredient[];
  handleIngredientSelect: (index: number, ingredient: Ingredient) => void;
  handleIngredientKeyDown: (e: React.KeyboardEvent, index: number, filteredIngredients: Ingredient[]) => void;
}

export const SortableIngredient: FC<SortableIngredientProps> = memo(({ 
  ingredient,
  index,
  onNameChange,
  onAmountChange,
  onUnitChange,
  onRemove,
  activeIngredient,
  setActiveIngredient,
  selectedSuggestionIndex,
  availableIngredients,
  handleIngredientSelect,
  handleIngredientKeyDown
}) => {
  if (!ingredient.id) {
    console.error('Ingredient missing ID:', ingredient);
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: ingredient.id,
    data: {
      index,
      ingredient
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease, opacity 200ms ease',
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    touchAction: 'none'
  };

  const filteredIngredients = availableIngredients.filter(ing => 
    ing.name.toLowerCase().includes(ingredient.name.toLowerCase())
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 items-center bg-white rounded-lg p-2 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-move touch-none">
        <Bars3Icon className="h-5 w-5 text-gray-500" />
      </div>

      <div className="flex-1 grid grid-cols-12 gap-2">
        {/* Name Input */}
        <div className="col-span-5 relative">
          <input
            id={`ingredient-${index}`}
            type="text"
            value={ingredient.name}
            onChange={(e) => onNameChange(index, e.target.value)}
            onFocus={() => setActiveIngredient({ index, field: 'name' })}
            onKeyDown={(e) => handleIngredientKeyDown(e, index, filteredIngredients)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ingredient name"
          />
          
          {/* Suggestions Dropdown */}
          {activeIngredient.index === index && activeIngredient.field === 'name' && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
              {filteredIngredients.map((ing, suggestionIndex) => (
                <button
                  key={ing.id}
                  onClick={() => handleIngredientSelect(index, ing)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    suggestionIndex === selectedSuggestionIndex ? 'bg-gray-100' : ''
                  }`}
                >
                  {ing.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="col-span-3">
          <input
            id={`amount-${index}`}
            type="number"
            value={ingredient.amount}
            onChange={(e) => onAmountChange(index, e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Amount"
            step="any"
          />
        </div>

        {/* Unit Input */}
        <div className="col-span-3">
          <input
            type="text"
            value={ingredient.unit}
            onChange={(e) => onUnitChange(index, e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Unit"
          />
        </div>

        {/* Remove Button */}
        <div className="col-span-1 flex justify-end">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default SortableIngredient; 