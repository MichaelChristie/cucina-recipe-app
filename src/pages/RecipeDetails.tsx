import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById } from "../services/recipeService";
import Layout from "../components/Layout";
import {
  ChevronLeftIcon,
  ClockIcon,
  ChartBarIcon,
  TagIcon,
  BeakerIcon,
  FireIcon,
  UserGroupIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import UnitToggle from "../components/UnitToggle";
import { useUnitPreference } from "../context/UnitPreferenceContext";
import Ingredient from "../components/Ingredient";
import { MDXEditor } from '@mdxeditor/editor';
import { marked } from 'marked';
import { getTags } from "../services/tagService";
import { getIngredients } from '../services/ingredientService';
import { Recipe, Tag, Ingredient as IngredientType } from '../types/recipe';

const getCategoryFromTags = (recipeTags: string[], allTags: Tag[]): string => {
  const tagCategories: Record<string, number> = {
    'special': 1,
    'style': 2,
    'cuisine': 3,
    'meal': 4,
    'diet': 5
  };
  
  const matchingTags = allTags
    .filter(tag => recipeTags.includes(tag.id))
    .sort((a, b) => (tagCategories[a.category] || 999) - (tagCategories[b.category] || 999));

  return matchingTags[0]?.name || 'Food & Drink';
};

export default function RecipeDetails(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allIngredients, setAllIngredients] = useState<IngredientType[]>([]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (!id) return;
        const data = await getRecipeById(id);
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
      {/* Breadcrumb */}
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

      {/* Hero Section */}
      <div className="relative w-full">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Content Area */}
          <div className="col-span-12 lg:col-span-4">
            <div className="max-w-7xl mx-auto">
              <div className="px-4 sm:px-6 lg:px-16 py-12 lg:py-20">
                {/* Category Link */}
                <div className="flex items-center justify-start">
                  <div className="text-base">
                    <span className="font-display font-bold uppercase tracking-wider">
                      {getCategoryFromTags(recipe.tags || [], allTags)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="mt-6 mb-4 font-display text-3xl md:text-4xl xl:text-5xl 
                             font-semibold leading-tight text-tasty-green">
                  {recipe.title}
                </h1>

                {/* Description */}
                <div className="prose max-w-none mt-6">
                  <p className="text-gray-700">{recipe.description}</p>
                </div>

                {/* Tags */}
                {recipe.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {allTags
                      .filter(tag => recipe.tags.includes(tag.id))
                      .map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm 
                                   bg-white/80 shadow-sm"
                        >
                          <span>{tag.emoji}</span>
                          <span className="text-gray-700">{tag.name}</span>
                        </span>
                      ))}
                  </div>
                )}

                {/* Quick Info Panel */}
                <div className="mt-8 bg-white rounded-xl shadow-sm">
                  <div className="flex flex-col divide-y divide-gray-100">
                    {/* Prep Time */}
                    {recipe.prepTime && (
                      <div className="flex items-center gap-3 p-4">
                        <div className="p-2.5 bg-earthgreen-50 rounded-lg">
                          <ClockIcon className="h-6 w-6 text-earthgreen-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Prep Time</p>
                          <p className="text-lg font-medium">{recipe.prepTime} min</p>
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
                          <p className="text-sm text-gray-500 font-medium">Cook Time</p>
                          <p className="text-lg font-medium">{recipe.cookTime} min</p>
                        </div>
                      </div>
                    )}

                    {/* Difficulty */}
                    {recipe.difficulty && (
                      <div className="flex items-center gap-3 p-4">
                        <div className="p-2.5 bg-olive-50/50 rounded-lg">
                          <ChartBarIcon className="h-6 w-6 text-olive-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Difficulty</p>
                          <p className="text-lg font-medium capitalize">{recipe.difficulty}</p>
                        </div>
                      </div>
                    )}

                    {/* Servings */}
                    {recipe.servings && (
                      <div className="flex items-center gap-3 p-4">
                        <div className="p-2.5 bg-khaki-50/50 rounded-lg">
                          <UserGroupIcon className="h-6 w-6 text-khaki-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Servings</p>
                          <p className="text-lg font-medium">{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="col-span-12 lg:col-span-8">
            <figure className="h-full">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              {recipe.imageCaption && (
                <figcaption className="mt-3 px-4 sm:px-6 lg:px-16 text-sm text-gray-600">
                  {recipe.imageCaption}
                </figcaption>
              )}
            </figure>
          </div>
        </div>
      </div>

      {/* Recipe Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Ingredients Column */}
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl font-semibold mb-6">Ingredients</h2>
            
            {/* Unit Toggle */}
            <div className="mb-8">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Measurement Units</span>
                <UnitToggle />
              </div>
            </div>

            {/* Servings Adjuster (optional) */}
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

                const ingredient = getIngredientById(item.ingredientId);
                if (!ingredient) return null;

                return (
                  <div key={`ingredient-${index}`} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-tasty-green/40"></div>
                    <Ingredient
                      amount={item.amount}
                      unit={item.unit}
                      name={ingredient.name}
                      defaultUnit={ingredient.defaultUnit}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Method Column */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold mb-6">Method</h2>
            <div className="space-y-8">
              {recipe.steps?.map((step, index) => (
                <div key={`step-${index}`} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-tasty-green/10 text-tasty-green font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="prose prose-gray prose-sm">
                      {typeof step === 'object' ? (
                        <>
                          <div dangerouslySetInnerHTML={{ __html: marked(step.text) }} />
                          {step.note && (
                            <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                              <strong>Note:</strong> {step.note}
                            </div>
                          )}
                        </>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: marked(step) }} />
                      )}
                    </div>
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