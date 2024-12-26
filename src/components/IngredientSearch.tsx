import { FC, useState, useRef, KeyboardEvent, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Ingredient } from '../types/recipe';

interface Props {
  ingredients: Ingredient[];
  selectedIngredients: Ingredient[];
  onSelectIngredient: (ingredient: Ingredient) => void;
  onRemoveIngredient: (ingredientId: string) => void;
  className?: string;
}

const IngredientSearch: FC<Props> = ({
  ingredients,
  selectedIngredients,
  onSelectIngredient,
  onRemoveIngredient,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredIngredients = ingredients
    .filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.some(selected => selected.id === ingredient.id)
    )
    .slice(0, 5);

  // Reset highlighted index when filtered ingredients change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to remove last chip when input is empty
    if (e.key === 'Backspace' && searchTerm === '' && selectedIngredients.length > 0) {
      e.preventDefault();
      onRemoveIngredient(selectedIngredients[selectedIngredients.length - 1].id);
      return;
    }

    // Only handle navigation keys if we have suggestions
    if (filteredIngredients.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setShowSuggestions(true);
        setHighlightedIndex(prev => 
          prev < filteredIngredients.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setShowSuggestions(true);
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredIngredients.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (showSuggestions && filteredIngredients[highlightedIndex]) {
          onSelectIngredient(filteredIngredients[highlightedIndex]);
          setSearchTerm('');
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className={`mt-4 relative ${className}`}>
      <div className="relative">
        <div className="min-h-[42px] w-full flex flex-wrap items-center gap-2 p-2 
                       bg-white border border-gray-300 rounded-lg 
                       focus-within:ring-1 focus-within:ring-forest-800/30 
                       focus-within:border-forest-800/50 transition-all duration-200">
          {selectedIngredients.map((ingredient) => (
            <span
              key={ingredient.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 
                       bg-forest-100 text-forest-800 text-sm rounded-full
                       ring-1 ring-forest-200/30"
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
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={selectedIngredients.length === 0 ? "Search ingredients..." : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent 
                     placeholder-gray-400 text-gray-900"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && searchTerm && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 
                     rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((ingredient, index) => (
                <button
                  key={ingredient.id}
                  className={`w-full px-4 py-2.5 text-left hover:bg-forest-50 
                           flex items-center gap-3 transition-colors duration-150
                           ${index === highlightedIndex ? 'bg-forest-50' : ''}`}
                  onClick={() => {
                    onSelectIngredient(ingredient);
                    setSearchTerm('');
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="text-lg">{ingredient.emoji}</span>
                  <span className="text-gray-900">{ingredient.name}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">
                No ingredients found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientSearch; 