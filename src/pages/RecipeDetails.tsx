import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  FireIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ChevronLeftIcon,
  MinusCircleIcon, 
  PlusCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { marked } from 'marked';
import Layout from '../components/Layout';
import { Recipe, IngredientType, Tag } from '../types/admin';
import { getRecipeById } from '../services/recipeService';
import { getTags } from '../services/tagService';
import { getIngredients } from '../services/ingredientService';
import { getCategoryFromTags } from '../utils/tagUtils';
import Ingredient from '../components/Ingredient';
import UnitToggle from '../components/UnitToggle';
import { auth } from '../config/firebase';

interface RecipeDetailsProps {
  isFavorite?: boolean;
  onToggleFavorite?: (recipeId: string) => void;
}

export default function RecipeDetails({ isFavorite = false, onToggleFavorite }: RecipeDetailsProps): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allIngredients, setAllIngredients] = useState<IngredientType[]>([]);
  const isAuthenticated = auth.currentUser !== null;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (!id) return;
        const data = await getRecipeById(id);
        console.log('Recipe data in component:', data);
        console.log('Ingredients structure:', data.ingredients);
        setRecipe(data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  useEffect(() => {
    const loadTags = async () => {
      const fetchedTags = await getTags();
      setAllTags(fetchedTags);
    };
    loadTags();
  }, []);

  useEffect(() => {
    const loadIngredients = async () => {
      const fetchedIngredients = await getIngredients();
      setAllIngredients(fetchedIngredients);
    };
    loadIngredients();
  }, []);

  const getIngredientById = (ingredientId: string): IngredientType | undefined => {
    return allIngredients.find(ing => ing.id === ingredientId);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite && isAuthenticated && recipe) {
      onToggleFavorite(recipe.id);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!recipe) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Recipe not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb with container */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Recipes</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{recipe.title}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="lg:grid lg:grid-cols-[1fr,50vw]">
        {/* Left Content Side */}
        <div className="relative">
          {/* Content Area */}
          <div className="max-w-3xl ml-auto px-4 sm:px-6 lg:pl-24 xl:px-48 py-12">
            {/* Title and Favorite Section */}
            <div className="flex items-center justify-between mt-6 mb-4">
              <h1 className="font-display text-3xl md:text-4xl xl:text-5xl leading-tight text-tasty-green">
                {recipe.title}
              </h1>
              
              {/* Favorite Button - Repositioned */}
              <div 
                onClick={handleFavoriteClick}
                className="cursor-pointer"
              >
                <button
                  type="button"
                  className={`${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? "Login to save favorites" : undefined}
                >
                  {isFavorite ? (
                    <HeartSolid 
                      className="w-8 h-8 text-cookred-600
                                 transform transition-all duration-300
                                 hover:scale-110" 
                    />
                  ) : (
                    <HeartIcon 
                      className="w-8 h-8 text-gray-900
                                 hover:text-cookred-600 transform transition-all duration-300
                                 hover:scale-110" 
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none mt-6">
              <p className="text-gray-700">{recipe.description}</p>
            </div>

            {/* Tags Section - Moved outside and above the green panel */}
            {recipe.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 mb-8">
                {recipe.tags
                  .map(tagId => {
                    // Handle both cases where tagId might be an object or a string
                    if (typeof tagId === 'object' && tagId !== null) {
                      return tagId; // It's already a tag object
                    }
                    return allTags.find(t => String(t.id) === String(tagId));
                  })
                  .filter((tag): tag is Tag => tag !== null && tag !== undefined)
                  .map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center shrink-0 px-2 py-1 rounded-full 
                               text-xs font-medium bg-olive-50 text-olive-600"
                    >
                      {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                      {tag.name}
                    </span>
                  ))}
              </div>
            )}

            {/* Tags and Quick Info Panel */}
              {/* Quick Info Panel */}
              <div className="flex flex-col divide-y divide-gray-200">
                {/* Prep Time */}
                {recipe.prepTime && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="p-2.5 bg-earthgreen-50 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-earthgreen-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Prep Time</p>
                      <p className="text-lg font-medium text-gray-900">{recipe.prepTime} min</p>
                    </div>
                  </div>
                )}

                {/* Cook Time */}
                {recipe.cookTime && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="p-2.5 bg-cookred-50 rounded-lg">
                      <FireIcon className="h-6 w-6 text-cookred-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Cook Time</p>
                      <p className="text-lg font-medium text-gray-900">{recipe.cookTime} min</p>
                    </div>
                  </div>
                )}

                {/* Difficulty */}
                {recipe.difficulty && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="p-2.5 bg-olive-50 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-olive-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Difficulty</p>
                      <p className="text-lg font-medium text-gray-900 capitalize">{recipe.difficulty}</p>
                    </div>
                  </div>
                )}

                {/* Servings */}
                {recipe.servings && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="p-2.5 bg-khaki-50 rounded-lg">
                      <UserGroupIcon className="h-6 w-6 text-khaki-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Servings</p>
                      <p className="text-lg font-medium text-gray-900">
                        {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="relative w-full h-screen hidden lg:block">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          {recipe.imageCaption && (
            <figcaption className="absolute bottom-0 left-0 right-0 px-4 py-2 text-sm text-white bg-black/50">
              {recipe.imageCaption}
            </figcaption>
          )}
        </div>

        {/* Mobile Image (shown only on small screens) */}
        <div className="lg:hidden w-full h-[500px]">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Recipe Content Container */}
      <div className="lg:grid lg:grid-cols-2">
        {/* Left Column - Ingredients */}
        <div className="lg:pl-24 xl:pl-64 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto py-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-2xl font-semibold">Ingredients</h2>
                <UnitToggle />
              </div>
            </div>
            
            {/* Servings Adjuster */}
            {recipe.servings && (
              <div className="mb-8">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Servings</span>
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-1 rounded-full hover:bg-gray-200"
                      onClick={() => {/* implement serving adjustment */}}
                    >
                      <MinusCircleIcon className="w-6 h-6 text-gray-500" />
                    </button>
                    <span className="text-sm font-medium">{recipe.servings}</span>
                    <button 
                      className="p-1 rounded-full hover:bg-gray-200"
                      onClick={() => {/* implement serving adjustment */}}
                    >
                      <PlusCircleIcon className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients List */}
            <div className="space-y-6">
              {recipe.ingredients?.map((item, index) => {
                // Debug log to see what we're getting
                console.log('Processing ingredient:', item);

                // Handle section dividers if they exist
                if ('type' in item && item.type === 'divider') {
                  return (
                    <div key={`section-${index}`} className="pt-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.label}</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                    </div>
                  );
                }

                // For regular ingredients
                return (
                  <div key={`ingredient-${index}`} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-tasty-green/40"></div>
                    <Ingredient
                      amount={item.amount}
                      unit={item.unit}
                      name={item.name}
                      defaultUnit={item.defaultUnit}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Method */}
        <div className="lg:pr-24 xl:pr-64 px-4 sm:px-6 lg:px-0">
          <div className="max-w-3xl mx-auto py-16">
            <h2 className="font-display text-2xl font-semibold mb-6">Method</h2>
            <div className="space-y-8">
              {recipe.steps?.map((step, index) => (
                <div key={`step-${index}`} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full 
                                  bg-tasty-green/10 text-tasty-green font-medium">
                      {step.order}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div 
                      className="prose prose-gray prose-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: marked(step.instruction || '') 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}