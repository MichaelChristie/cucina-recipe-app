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
  MagnifyingGlassIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { getTags } from '../services/tagService';
import { getRecipes } from '../services/recipeService';
import { getIngredients } from '../services/ingredientService';
import Card from './Card';
import { Recipe, Tag, Ingredient } from '../types/admin';
import { useOrderedRecipes } from '../hooks/useOrderedRecipes';
import { getPriorityTags } from '../utils/tagUtils';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  icon: React.ForwardRefExoticComponent<any>;
}

interface FeaturedCarouselProps { 
  recipes: Recipe[];
  tags: Tag[];
  categories: Category[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  openCategory: string | null;
  setOpenCategory: (category: string | null) => void;
  renderIngredientSearch: () => JSX.Element;
  getTagsByCategory: (category: string) => Tag[];
  getTagById: (tagId: string) => Tag | undefined;
  ingredients: Ingredient[];
  selectedIngredients: string[];
  setSelectedIngredients: (ingredients: string[]) => void;
  getIngredientById: (ingredientId: string) => Ingredient | undefined;
}

const FeaturedCarousel: FC<FeaturedCarouselProps> = ({ 
  recipes, 
  tags, 
  categories,
  selectedTags,
  setSelectedTags,
  openCategory,
  setOpenCategory,
  renderIngredientSearch,
  getTagsByCategory,
  getTagById,
  ingredients,
  selectedIngredients,
  setSelectedIngredients,
  getIngredientById
}) => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);

  const featuredRecipes = recipes.filter(recipe => recipe.featured);

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
    if (featuredRecipes.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(current => 
        current === featuredRecipes.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredRecipes.length]);

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

  if (featuredRecipes.length === 0) return null;

  const currentRecipe = featuredRecipes[currentIndex];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: Implement search functionality
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

  return (
    <div className="relative w-full h-[600px] overflow-visible">
      {/* Background Image */}
      <div className="absolute inset-0">
        {featuredRecipes.map((recipe, index) => (
          <div
            key={recipe.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={typeof recipe.image === 'string' ? recipe.image : recipe.image?.url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Container for all content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content - Top right aligned with grid */}
        <div className="absolute top-20 right-0 z-10 w-[300px]">
          {featuredRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className={`transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl">
                <div className="p-6">
                  <h2 className="font-display text-xl font-medium text-gray-900 mb-4">
                    {recipe.title}
                  </h2>
                  
                  <div className="flex items-center justify-between">
                    {/* Primary Tag */}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex items-center">
                        {(() => {
                          const primaryTag = tags.find(tag => tag.id === recipe.tags[0]);
                          if (primaryTag) {
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm 
                                             bg-tasty-green/10 text-tasty-green">
                                <span>{primaryTag.emoji}</span>
                                <span>{primaryTag.name}</span>
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Arrow Button */}
                    <button
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full 
                                 bg-tasty-green/10 text-tasty-green hover:bg-tasty-green/20 transition-colors"
                    >
                      <ArrowUpRightIcon className="h-4 w-4" />
                      <span className="sr-only">View Recipe</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Section - Overlapping bottom */}
        <div className="absolute -bottom-24 left-0 right-0 z-10">
          <div className="bg-tasty-green rounded-2xl shadow-xl p-8">
            {/* Title and Categories in a row */}
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-3xl text-white">
                Find Your Next Favorite Dish
              </h1>

              {/* Category buttons and search - reorganized for better stacking */}
              <div className="flex flex-col gap-4 w-full">
                {/* Categories and Ingredient Search Container */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Categories - buttons in a row that wrap */}
                  <div className="flex flex-wrap items-center gap-2">
                    {categories.map(({ id, name, icon: Icon }) => (
                      <div key={id} className="relative">
                        <button
                          onClick={() => setOpenCategory(openCategory === id ? null : id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white 
                            ${openCategory === id 
                              ? 'bg-white/20 border-white/30' 
                              : 'hover:bg-white/10 border-white/20'
                            } border transition-colors`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{name}</span>
                          <ChevronDownIcon className="h-4 w-4" />
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

                  {/* Ingredient Search - Full width on desktop */}
                  <div className="lg:flex-1">
                    {renderIngredientSearch()}
                  </div>
                </div>

                {/* Selected Tags and Ingredients Display */}
                {(selectedTags.length > 0 || selectedIngredients.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {/* Selected Tags */}
                    {selectedTags.map(tagId => {
                      const tag = getTagById(tagId);
                      if (!tag) return null;
                      
                      return (
                        <button
                          key={tag.id}
                          onClick={() => setSelectedTags(prev => prev.filter(id => id !== tag.id))}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm 
                                   bg-white/10 text-white hover:bg-white/20 transition-colors group"
                        >
                          <span>{tag.emoji}</span>
                          <span>{tag.name}</span>
                          <XMarkIcon className="h-4 w-4 text-white/60 group-hover:text-white/80" />
                        </button>
                      );
                    })}

                    {/* Selected Ingredients */}
                    {selectedIngredients.map(ingredientId => {
                      const ingredient = getIngredientById(ingredientId);
                      if (!ingredient) return null;
                      
                      return (
                        <button
                          key={ingredient.id}
                          onClick={() => setSelectedIngredients(prev => prev.filter(id => id !== ingredient.id))}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm 
                                   bg-white/10 text-white hover:bg-white/20 transition-colors group"
                        >
                          <BeakerIcon className="h-4 w-4 text-white/60" />
                          <span>{ingredient.name}</span>
                          <XMarkIcon className="h-4 w-4 text-white/60 group-hover:text-white/80" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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

  const renderIngredientSearch = () => (
    <div className="relative flex-1" ref={searchRef}>
      <div className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 w-full">
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

      {/* Dropdown remains white for better readability */}
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
        getTagById={getTagById}
        ingredients={ingredients}
        selectedIngredients={selectedIngredients}
        setSelectedIngredients={setSelectedIngredients}
        getIngredientById={getIngredientById}
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-32">
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