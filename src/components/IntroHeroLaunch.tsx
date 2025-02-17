import { FC, useState, useEffect } from 'react';
import RecipeGrid from './RecipeGrid';
import { getTags } from '../services/tagService.ts';
import { getRecipes } from '../services/recipeService.ts';
import { Tag } from '../types/admin';
import { Recipe } from '../types/recipe';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import IngredientSearch from './IngredientSearch';
import { getIngredients } from '../services/ingredientService.ts';
import { Ingredient } from '../types/admin';
import { PiLeafLight, PiForkKnife, PiChefHat, PiCarrot, PiCookingPot, PiSunHorizon } from "react-icons/pi";
import { HiOutlineGlobeEuropeAfrica } from "react-icons/hi2";
import { IconContext } from 'react-icons';

interface FilterSection {
  name: string;
  icon: React.ReactNode;
  category: string;
}

const categories = [
  { name: 'Meal Type', icon: <IconContext.Provider value={{ className: "w-5 h-5" }}><PiForkKnife /></IconContext.Provider>, category: 'meal type' },
  { name: 'Cuisine', icon: <IconContext.Provider value={{ className: "w-5 h-5" }}><HiOutlineGlobeEuropeAfrica /></IconContext.Provider>, category: 'cuisine' },
  { name: 'Dietary', icon: <IconContext.Provider value={{ className: "w-5 h-5" }}><PiLeafLight /></IconContext.Provider>, category: 'dietary' },
  { name: 'Style', icon: <IconContext.Provider value={{ className: "w-5 h-5" }}><PiChefHat /></IconContext.Provider>, category: 'style' },
  { name: 'Season', icon: <IconContext.Provider value={{ className: "w-5 h-5" }}><PiSunHorizon /></IconContext.Provider>, category: 'season' },
  { name: 'Method', icon: <IconContext.Provider value={{ className: "w-5 h-5" }}><PiCookingPot /></IconContext.Provider>, category: 'method' },
];

const IntroHeroLaunch: FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [groupedTags, setGroupedTags] = useState<Record<string, Tag[]>>({});
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);

  // Add autoplay interval state and timing constant
  const SLIDE_DURATION = 5000; // 5 seconds per slide

  useEffect(() => {
    const loadData = async () => {
      const [fetchedTags, allRecipes, allIngredients] = await Promise.all([
        getTags(),
        getRecipes(),
        getIngredients()
      ]);

      setTags(fetchedTags);
      setFeaturedRecipes(allRecipes.filter(recipe => recipe.featured));
      setIngredients(allIngredients);

      // Group tags by category
      const grouped = fetchedTags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
          acc[tag.category] = [];
        }
        acc[tag.category].push(tag);
        return acc;
      }, {} as Record<string, Tag[]>);
      setGroupedTags(grouped);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Set up autoplay for the carousel
    const interval = setInterval(() => {
      nextFeatured();
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [currentFeaturedIndex, featuredRecipes.length]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(String(tagId))) {
        newSet.delete(String(tagId));
      } else {
        newSet.add(String(tagId));
      }
      return newSet;
    });
  };

  const nextFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === featuredRecipes.length - 1 ? 0 : prev + 1
    );
  };

  const prevFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === 0 ? featuredRecipes.length - 1 : prev - 1
    );
  };

  const currentFeatured = featuredRecipes[currentFeaturedIndex];

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients(prev => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => 
      prev.filter(ingredient => ingredient.id !== ingredientId)
    );
  };

  return (
    <div>
      {/* Hero Section with Featured Recipe */}
      <div className="relative h-[600px]">
        {/* Carousel Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Carousel Slides */}
          <div className="absolute inset-0">
            {featuredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out
                  ${index === currentFeaturedIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Recipe Info Card */}
                <div className="absolute bottom-8 right-8 z-10">
                  <div className="max-w-[2000px] mx-auto">
                    <div className="ml-auto max-w-xs">
                      <Link 
                        to={`/recipe/${recipe.id}`}
                        className="group block bg-black/0 backdrop-blur-sm rounded-xl p-6 
                                 hover:bg-black/10 transition-colors"
                      >
                        {/* Title and Arrow Section */}
                        <div className="flex items-center justify-between mb-2">
                          <h1 className="text-1xl font-display text-white">
                            {recipe.title}
                          </h1>
                          <ArrowUpRightIcon className="w-4 h-4 text-white" />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-white/80 line-clamp-2 mb-3">
                          {recipe.description}
                        </p>

                        {/* Recipe Tags */}
                        <div className="flex gap-2">
                          {recipe.tags?.slice(0, 3).map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            return tag ? (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-1 rounded-full 
                                         text-xs bg-white/10 text-white"
                              >
                                {tag.emoji} {tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar - Now centered within carousel */}
          <div className="relative z-50 w-full lg:w-1/2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl py-8 text-gray-900 lg:px-8 shadow-lg">
              <h2 className="text-4xl font-display mb-4 text-gray-900">
                Find Your Next Favorite Dish
              </h2>
              
              <div className="">
                {/* Tag Filter Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  {categories.slice(0, 3).map((section) => (
                    <Popover key={section.category} className="relative w-full">
                      <Popover.Button className="w-full flex items-center justify-between px-4 py-2 rounded-lg 
                                             bg-white/10 backdrop-blur-sm text-gray-900 hover:bg-white/20
                                             transition-colors focus:outline-none">
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span>{section.name}</span>
                        </div>
                        <ChevronDownIcon className="w-4 h-4" />
                      </Popover.Button>

                      <Popover.Panel className="absolute z-[60] mt-2 w-56 bg-white rounded-lg shadow-lg p-2">
                        <div className="space-y-2">
                          {groupedTags[section.category]?.map((tag) => (
                            <label
                              key={tag.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTags.has(String(tag.id))}
                                onChange={() => toggleTag(String(tag.id))}
                                className="rounded border-gray-300 text-forest-800
                                        focus:ring-forest-800"
                              />
                              <span className="mr-2">{tag.emoji}</span>
                              <span className="text-sm text-gray-900">{tag.name}</span>
                            </label>
                          ))}
                        </div>
                      </Popover.Panel>
                    </Popover>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {categories.slice(3).map((section) => (
                    <Popover key={section.category} className="relative w-full">
                      <Popover.Button className="w-full flex items-center justify-between px-4 py-2 rounded-lg 
                                             bg-white/10 backdrop-blur-sm text-gray-900 hover:bg-white/20
                                             transition-colors focus:outline-none">
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span>{section.name}</span>
                        </div>
                        <ChevronDownIcon className="w-4 h-4" />
                      </Popover.Button>

                      <Popover.Panel className="absolute z-[60] mt-2 w-56 bg-white rounded-lg shadow-lg p-2">
                        <div className="space-y-2">
                          {groupedTags[section.category]?.map((tag) => (
                            <label
                              key={tag.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTags.has(String(tag.id))}
                                onChange={() => toggleTag(String(tag.id))}
                                className="rounded border-gray-300 text-forest-800
                                        focus:ring-forest-800"
                              />
                              <span className="mr-2">{tag.emoji}</span>
                              <span className="text-sm text-gray-900">{tag.name}</span>
                            </label>
                          ))}
                        </div>
                      </Popover.Panel>
                    </Popover>
                  ))}
                </div>

                {/* Ingredient Search */}
                <div className="mt-4">
                  <div className="relative">

                    <IngredientSearch
                      ingredients={ingredients}
                      selectedIngredients={selectedIngredients}
                      onSelectIngredient={handleSelectIngredient}
                      onRemoveIngredient={handleRemoveIngredient}
                      className="w-full pl-2 pr-2 py-2 rounded-lg
                                bg-white/80  border-0
                                text-gray-900 placeholder:text-gray-500
                                focus:ring-2 focus:ring-inset focus:ring-forest-600"
                      placeholder="Search ingredients..."
                    />
                  </div>
                  
                  {/* Selected Items Display */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {/* Selected Tags */}
                    {Array.from(selectedTags).map((tagId) => {
                      const tag = tags.find(t => String(t.id) === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm 
                                   bg-tasty-background text-gray-900"
                        >
                          <span>{tag.emoji} {tag.name}</span>
                          <button
                            onClick={() => toggleTag(String(tag.id))}
                            className="ml-1 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation */}
          <div className="absolute bottom-8 left-8 z-20 flex gap-2">
            {featuredRecipes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeaturedIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors
                  ${index === currentFeaturedIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="py-8">
        <RecipeGrid 
          tags={tags} 
          selectedTags={Array.from(selectedTags)}
          selectedIngredients={selectedIngredients}
        />
      </div>
    </div>
  );
};

export default IntroHeroLaunch; 