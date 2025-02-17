import { FC, useState, useRef, KeyboardEvent, useEffect, ChangeEvent, FocusEvent } from 'react';
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Ingredient } from '../types/admin';

interface Props {
  ingredients: Ingredient[];
  selectedIngredients: Ingredient[];
  onSelectIngredient: (ingredient: Ingredient) => void;
  onRemoveIngredient: (ingredientId: string) => void;
  className?: string;
  placeholder?: string;
}

const IngredientSearch: FC<Props> = ({
  ingredients,
  selectedIngredients,
  onSelectIngredient,
  onRemoveIngredient,
  className = '',
  placeholder = 'Filter by ingredients...'
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter ingredients based on search term
  const filteredIngredients = ingredients
    .filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.some(selected => selected.id === ingredient.id)
    )
    .slice(0, 5);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log('Key pressed:', e.key);
    console.log('Current highlighted index:', highlightedIndex);
    console.log('Filtered ingredients:', filteredIngredients);
    console.log('Show suggestions:', showSuggestions);
    
    if (filteredIngredients.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = highlightedIndex < filteredIngredients.length - 1 ? highlightedIndex + 1 : 0;
          console.log('Setting highlighted index to:', nextIndex);
          setShowSuggestions(true);
          setHighlightedIndex(nextIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = highlightedIndex > 0 ? highlightedIndex - 1 : filteredIngredients.length - 1;
          console.log('Setting highlighted index to:', prevIndex);
          setShowSuggestions(true);
          setHighlightedIndex(prevIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (showSuggestions && filteredIngredients[highlightedIndex]) {
            onSelectIngredient(filteredIngredients[highlightedIndex]);
            setSearchTerm('');
            setShowSuggestions(false);
            setHighlightedIndex(0);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          setHighlightedIndex(0);
          break;
      }
    }

    // Handle backspace for removing last ingredient
    if (e.key === 'Backspace' && searchTerm === '' && selectedIngredients.length > 0) {
      e.preventDefault();
      onRemoveIngredient(selectedIngredients[selectedIngredients.length - 1].id);
    }
  };

  return (
    <div className={`mt-4 relative p-0 ${className}`}>
      <div className="relative">
        <div className="min-h-[42px] w-full flex flex-wrap items-center gap-2 p-2 
                      rounded-lg bg-white
                      focus-within:ring-2 focus-within:ring-sage-600 focus-within:border-sage-600
                      transition-all duration-150">
          {selectedIngredients.map((ingredient) => (
            <span
              key={ingredient.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 
                       bg-sage-50 text-sage-600 text-sm rounded-full"
            >
              <span className="flex items-center gap-1.5">
                <span>{ingredient.emoji}</span>
                <span>{ingredient.name}</span>
              </span>
              <button
                onClick={() => onRemoveIngredient(ingredient.id)}
                className="p-0.5 hover:bg-forest-200 rounded-full 
                         transition-colors duration-150"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          
          <div className="flex items-center flex-1 min-w-[120px]">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                // Delay hiding suggestions to allow for click events
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder={placeholder}
              className="w-full outline-none bg-transparent 
                       placeholder-gray-400 text-gray-900"
            />
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-900 ml-2" />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && searchTerm && filteredIngredients.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 
                     rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredIngredients.map((ingredient, index) => (
              <button
                key={ingredient.id}
                className={`w-full px-4 py-2.5 text-left 
                         flex items-center gap-3 transition-colors duration-150
                         ${index === highlightedIndex 
                           ? 'bg-sage-50 text-sage-600 font-medium' 
                           : 'text-gray-900 hover:bg-sage-50/50'}`}
                onClick={() => {
                  onSelectIngredient(ingredient);
                  setSearchTerm('');
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span>{ingredient.emoji}</span>
                <span>{ingredient.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientSearch; 