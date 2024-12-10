import React, { useEffect, useState } from 'react'
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

            {/* Add Ingredient Search Button */}
            <button
              onClick={() => setIsIngredientSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10"
            >
              {/* <BeakerIcon className="h-5 w-5" /> */}
              Search by Ingredient
            </button>

            {/* Ingredient Search Modal */}
            {isIngredientSearchOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Search by Ingredients</h2>
                    <button
                      onClick={() => setIsIngredientSearchOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {ingredients.map((ingredient) => (
                      <label
                        key={ingredient.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(ingredient.id)}
                          onChange={() => {
                            setSelectedIngredients(prev =>
                              prev.includes(ingredient.id)
                                ? prev.filter(id => id !== ingredient.id)
                                : [...prev, ingredient.id]
                            );
                          }}
                          className="rounded border-gray-300 text-tasty-green focus:ring-tasty-green"
                        />
                        <span>{ingredient.name}</span>
                        <span className="text-sm text-gray-500">
                          ({ingredient.category})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
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