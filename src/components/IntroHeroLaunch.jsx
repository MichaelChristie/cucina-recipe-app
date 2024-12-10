import React, { useEffect, useState, useRef } from 'react'
import { 
  HeartIcon, 
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
// import { BeakerIcon } from '@heroicons/react/24/solid'
import { getTags } from '../services/tagService'
import { getRecipes } from '../services/recipeService'
import { getIngredients } from '../services/ingredientService'
import Card from './Card'

function IntroHeroLaunch() {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isIngredientSearchOpen, setIsIngredientSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const [fetchedTags, fetchedRecipes, fetchedIngredients] = await Promise.all([
        getTags(),
        getRecipes(),
        getIngredients()
      ]);
      setTags(fetchedTags);
      setRecipes(fetchedRecipes);
      setIngredients(fetchedIngredients);
    };
    loadData();
  }, []);

  // Get unique categories from tags
  const categories = [...new Set(tags.map(tag => tag.category))].map(category => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1) // Capitalize first letter
  }));

  const getTagsByCategory = (category) => {
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

  const handleCategoryClick = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const getTagById = (tagId) => {
    return tags.find(tag => tag.id === tagId);
  };

  // Add keyboard event handler
  const handleKeyDown = (e) => {
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

  // Reset highlighted index when filtered ingredients change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredIngredients]);

  // Add this useEffect to handle clicks outside the search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add this useEffect to filter ingredients based on search term
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

  // Update the renderIngredientSearch function
  const renderIngredientSearch = () => (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center gap-2 px-4 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10">
        <BeakerIcon className="h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search ingredients..."
          className="bg-transparent outline-none placeholder-tasty-green/60"
        />
      </div>

      {/* Dropdown for search results */}
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

  // Add this helper function near your other helper functions
  const getIngredientById = (ingredientId) => {
    return ingredients.find(ingredient => ingredient.id === ingredientId);
  };

  return (
    <div className="w-full">
      <div className="bg-white p-8 rounded-2xl">
        <h1 className="font-display text-display-large text-tasty-green mb-8">
          Find Your Next Favorite Dish
        </h1>

        {/* Category dropdowns and search bar container */}
        <div className="flex flex-wrap items-start gap-4">
          {/* Category dropdowns wrapper */}
          <div className="flex flex-wrap gap-2">
            {categories.map(({ id, name }) => (
              <div key={id} className="relative">
                <button
                  onClick={() => handleCategoryClick(id)}
                  className="flex items-center gap-2 px-4 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10"
                >
                  {name}
                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${
                    openCategory === id ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {openCategory === id && (
                  <div 
                    className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg transition-opacity duration-300"
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
                              // Close the dropdown after selection
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

            {renderIngredientSearch()}
          </div>

          {/* Search bar that fills remaining space */}
          <div className="flex flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <input 
                type="text"
                className="w-full border border-tasty-green rounded-l-lg px-4 py-2 pl-10 text-tasty-green placeholder-tasty-green/60"
                placeholder="Search your favourite dish"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-tasty-green/60 h-5 w-5" />
            </div>
            <button className="px-4 py-2 bg-tasty-green border border-tasty-green rounded-r-lg text-white font-medium hover:bg-tasty-green/90">
              Search
            </button>
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
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 [grid-auto-rows:1fr]">
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
  )
}

export default IntroHeroLaunch 