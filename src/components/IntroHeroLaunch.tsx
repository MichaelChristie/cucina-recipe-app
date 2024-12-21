import { FC, useEffect, useState, useRef, KeyboardEvent } from 'react';
import { 
  HeartIcon, 
  ChevronDownIcon,
  XMarkIcon,
  BeakerIcon,
  LightBulbIcon,
  SparklesIcon,
  GlobeEuropeAfricaIcon,
  FireIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { getTags } from '../services/tagService';
import { getRecipes } from '../services/recipeService';
import { getIngredients } from '../services/ingredientService';
import Card from './Card';
import { Recipe, Tag, Ingredient } from '../types/admin';

interface Category {
  id: string;
  name: string;
  icon: React.ForwardRefExoticComponent<any>;
}

const IntroHeroLaunch: FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isIngredientSearchOpen, setIsIngredientSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const [fetchedTags, fetchedRecipes, fetchedIngredients] = await Promise.all([
        getTags(),
        getRecipes(),
        getIngredients()
      ]);
      setTags(fetchedTags);
      setRecipes(fetchedRecipes as Recipe[]);
      setIngredients(fetchedIngredients);
    };
    loadData();
  }, []);

  const categories: Category[] = [...new Set(tags.map(tag => tag.category))].map(category => {
    const icons: Record<string, React.ForwardRefExoticComponent<any>> = {
      diet: LightBulbIcon,
      meal: Squares2X2Icon,
      cuisine: GlobeEuropeAfricaIcon,
      style: FireIcon,
      special: SparklesIcon
    };
    
    return {
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      icon: icons[category] || BeakerIcon
    };
  });

  const getTagsByCategory = (category: string): Tag[] => {
    return tags.filter(tag => tag.category === category);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesTags = selectedTags.length === 0 || 
      recipe.tags?.some(tagId => selectedTags.includes(tagId));
    
    const matchesIngredients = selectedIngredients.length === 0 ||
      selectedIngredients.every(ingredientId =>
        recipe.ingredients?.some(ing => ing.ingredientId === ingredientId)
      );

    return matchesTags && matchesIngredients;
  });

  const handleCategoryClick = (category: string): void => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const getTagById = (tagId: string): Tag | undefined => {
    return tags.find(tag => tag.id === tagId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (!isSearchFocused || filteredIngredients.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredIngredients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const selectedIngredient = filteredIngredients[highlightedIndex];
          setSelectedIngredients(prev => [...prev, selectedIngredient.id]);
          setSearchTerm('');
          setIsSearchFocused(true);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredIngredients]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = ingredients.filter(
        ing => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedIngredients.includes(ing.id)
      );
      setFilteredIngredients(filtered);
    } else {
      setFilteredIngredients([]);
    }
  }, [searchTerm, ingredients, selectedIngredients]);

  const renderIngredientSearch = () => (
    <div className="relative w-full" ref={searchRef}>
      <div className="flex items-center gap-2 px-4 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10 w-full">
        <BeakerIcon className="h-5 w-5 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Filter by ingredients..."
          className="bg-transparent outline-none placeholder-tasty-green/60 w-full"
        />
      </div>

      {isSearchFocused && filteredIngredients.length > 0 && (
        <div className="absolute z-20 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredIngredients.map((ingredient, index) => (
            <button
              key={ingredient.id}
              onClick={() => {
                setSelectedIngredients(prev => [...prev, ingredient.id]);
                setSearchTerm('');
                inputRef.current?.focus();
                setIsSearchFocused(true);
                setHighlightedIndex(-1);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-4 py-2 flex items-center justify-between ${
                highlightedIndex === index 
                  ? 'bg-tasty-green/10 text-tasty-green'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>{ingredient.name}</span>
              <span className="text-sm text-gray-500">
                ({ingredient.category})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const getIngredientById = (ingredientId: string): Ingredient | undefined => {
    return ingredients.find(ingredient => ingredient.id === ingredientId);
  };

  return (
    <div className="w-full">
      <div className="pb-8">
        <h1 className="font-display text-display-large text-tasty-green mb-8">
          Find Your Next Favorite Dish
        </h1>

        {/* Category dropdowns and search bar container */}
        <div className="flex flex-wrap items-start gap-4">
          {/* Category dropdowns wrapper */}
          <div className="flex flex-wrap gap-2 w-full">
            {categories.map(({ id, name, icon: Icon }) => (
              <div key={id} className="relative">
                <button
                  onClick={() => handleCategoryClick(id)}
                  className="flex items-center gap-2 px-4 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10"
                >
                  <Icon className="h-5 w-5" />
                  <span>{name}</span>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${
                    openCategory === id ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {openCategory === id && (
                  <div 
                    className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg transition-opacity duration-300"
                  >
                    <div className="p-2 space-y-1">
                      {getTagsByCategory(id).map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => {
                              setSelectedTags(prev =>
                                prev.includes(tag.id)
                                  ? prev.filter(tagId => tagId !== tag.id)
                                  : [...prev, tag.id]
                              );
                              setOpenCategory(null);
                            }}
                            className="rounded border-gray-300 text-tasty-green focus:ring-tasty-green"
                          />
                          <span className="flex items-center gap-1">
                            <span>{tag.emoji}</span>
                            <span>{tag.name}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="flex-1">
              {renderIngredientSearch()}
            </div>
          </div>
        </div>

        {/* Selected tags display */}
        {selectedTags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tagId => {
                const tag = getTagById(tagId);
                if (!tag) return null;
                
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-tasty-green/10 text-tasty-green border border-tasty-green/20 rounded-full text-sm"
                  >
                    <span className="flex items-center gap-1">
                      <span>{tag.emoji}</span>
                      <span>{tag.name}</span>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.filter(id => id !== tag.id)
                        );
                      }}
                      className="p-0.5 hover:bg-tasty-green/10 rounded-full"
                    >
                      <XMarkIcon className="h-4 w-4 text-tasty-green" />
                    </button>
                  </div>
                );
              })}
              
              {/* Clear all button */}
              {selectedTags.length > 1 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-full"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected ingredients display */}
        {selectedIngredients.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map(ingredientId => {
                const ingredient = getIngredientById(ingredientId);
                if (!ingredient) return null;
                
                return (
                  <div
                    key={ingredient.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-tasty-green/10 text-tasty-green border border-tasty-green/20 rounded-full text-sm"
                  >
                    <span>{ingredient.name}</span>
                    <button
                      onClick={() => {
                        setSelectedIngredients(prev => 
                          prev.filter(id => id !== ingredient.id)
                        );
                      }}
                      className="p-0.5 hover:bg-tasty-green/10 rounded-full"
                    >
                      <XMarkIcon className="h-4 w-4 text-tasty-green" />
                    </button>
                  </div>
                );
              })}
              
              {/* Clear all ingredients button */}
              {selectedIngredients.length > 1 && (
                <button
                  onClick={() => setSelectedIngredients([])}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-full"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recipe cards grid */}
      <div className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 [grid-auto-rows:1fr] max-w-[2000px] w-full mx-auto">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="h-full flex flex-col">
              <Card 
                recipe={recipe} 
                tags={tags}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroHeroLaunch; 