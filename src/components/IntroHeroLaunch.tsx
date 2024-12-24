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
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { getTags } from '../services/tagService';
import { getRecipes } from '../services/recipeService';
import { getIngredients } from '../services/ingredientService';
import Card from './Card';
import { Recipe, Tag, Ingredient } from '../types/admin';
import { useOrderedRecipes } from '../hooks/useOrderedRecipes';
import { getPriorityTags } from '../utils/tagUtils';

interface Category {
  id: string;
  name: string;
  icon: React.ForwardRefExoticComponent<any>;
}

const FeaturedCarousel: FC<{ 
  recipes: Recipe[], 
  tags: Tag[],
  categories: Category[],
  selectedTags: string[],
  setSelectedTags: (tags: string[]) => void,
  openCategory: string | null,
  setOpenCategory: (category: string | null) => void,
  renderIngredientSearch: () => JSX.Element,
  getTagsByCategory: (category: string) => Tag[]
}> = ({ 
  recipes, 
  tags, 
  categories,
  selectedTags,
  setSelectedTags,
  openCategory,
  setOpenCategory,
  renderIngredientSearch,
  getTagsByCategory
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredRecipes = recipes.filter(recipe => recipe.featured);

  useEffect(() => {
    if (featuredRecipes.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(current => 
        current === featuredRecipes.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredRecipes.length]);

  if (featuredRecipes.length === 0) return null;

  const currentRecipe = featuredRecipes[currentIndex];

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Title Section with Category Buttons */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title and Categories in a row */}
          <div className="flex flex-col gap-8">
            <h1 className="font-display text-display-large text-white">
              Find Your Next Favorite Dish
            </h1>

            {/* Category buttons and search - single row */}
            <div className="flex items-center gap-4 w-full">
              {/* Categories */}
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map(({ id, name, icon: Icon }) => (
                  <div key={id} className="relative">
                    <button
                      onClick={() => setOpenCategory(openCategory === id ? null : id)}
                      className="flex items-center gap-2 px-4 py-2 border border-white rounded-lg text-white hover:bg-white/10"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{name}</span>
                      <ChevronDownIcon className={`h-5 w-5 transition-transform ${
                        openCategory === id ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {openCategory === id && (
                      <div className="absolute z-20 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
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
                              <span className="flex items-center gap-1 text-gray-700">
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
              </div>

              {/* Search inputs */}
              <div className="flex gap-4 flex-1 min-w-[500px]">
                {renderIngredientSearch()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={typeof currentRecipe.image === 'string' ? currentRecipe.image : currentRecipe.image?.url}
          alt={currentRecipe.title}
          className="w-full h-full object-cover transition-transform duration-500"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t  to-transparent" 

        />
      </div>

      {/* Content - Pinned to bottom */}
      <div className="absolute bottom-0 right-8 max-w-xl w-full">
        <div className="bg-tasty-green/90 backdrop-blur-sm p-8 rounded-t-xl w-full shadow-xl">
          <h2 className="font-display text-3xl font-medium text-white mb-4">
            {currentRecipe.title}
          </h2>
          
          <p className="text-white/90 mb-6 line-clamp-3">
            {currentRecipe.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-2">
            {getPriorityTags(currentRecipe.tags, tags).map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTags(prev => [...prev, tag.id]);
                  setOpenCategory(null);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                {tag.emoji} {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredRecipes.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(current => 
              current === 0 ? featuredRecipes.length - 1 : current - 1
            )}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrentIndex(current => 
              current === featuredRecipes.length - 1 ? 0 : current + 1
            )}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {featuredRecipes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredRecipes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-4' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const IntroHeroLaunch: FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { recipes, loading: recipesLoading } = useOrderedRecipes();
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [fetchedTags, fetchedIngredients] = await Promise.all([
        getTags(),
        getIngredients()
      ]);
      setTags(fetchedTags);
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: Implement search functionality
  };

  const renderIngredientSearch = () => (
    <>
      {/* Ingredients Search */}
      <div className="relative flex-1" ref={searchRef}>
        <div className="flex items-center gap-2 px-4 py-2 border border-white rounded-lg text-white hover:bg-white/10 w-full">
          <BeakerIcon className="h-5 w-5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Filter by ingredients..."
            className="bg-transparent outline-none placeholder-white/60 w-full text-white"
          />
        </div>

        {/* Existing dropdown for ingredients */}
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

      {/* Recipe Search */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="flex items-center gap-2 px-4 py-2 border border-white rounded-lg text-white hover:bg-white/10 w-full">
          <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="bg-transparent outline-none placeholder-white/60 w-full text-white"
          />
        </div>
      </form>
    </>
  );

  const getIngredientById = (ingredientId: string): Ingredient | undefined => {
    return ingredients.find(ingredient => ingredient.id === ingredientId);
  };

  return (
    <div className="-mt-16 w-full">
      <FeaturedCarousel 
        recipes={recipes} 
        tags={tags}
        categories={categories}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        openCategory={openCategory}
        setOpenCategory={setOpenCategory}
        renderIngredientSearch={renderIngredientSearch}
        getTagsByCategory={getTagsByCategory}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Recipe cards grid */}
        <div className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 [grid-auto-rows:1fr] max-w-[2000px] w-full mx-auto">
            {recipesLoading ? (
              <div>Loading recipes...</div>
            ) : (
              filteredRecipes.map(recipe => (
                <div key={recipe.id} className="h-full flex flex-col">
                  <Card 
                    recipe={recipe} 
                    tags={tags}
                    className="flex-1"
                    onTagClick={(tagId, category) => {
                      setSelectedTags(prev => [...prev, tagId]);
                      setOpenCategory(null);
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroHeroLaunch; 