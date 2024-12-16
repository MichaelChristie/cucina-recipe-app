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
                <div className="mt-8 p-4">
                  <div className="flex flex-col gap-4">
                    {recipe.prepTime && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-gray-700" />
                        <div>
                          <p className="text-sm text-gray-500">Prep Time</p>
                          <p className="font-medium">{recipe.prepTime}</p>
                        </div>
                      </div>
                    )}
                    {recipe.cookTime && (
                      <div className="flex items-center gap-2">
                        <FireIcon className="h-5 w-5 text-gray-700" />
                        <div>
                          <p className="text-sm text-gray-500">Cook Time</p>
                          <p className="font-medium">{recipe.cookTime}</p>
                        </div>
                      </div>
                    )}
                    {recipe.difficulty && (
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-gray-700" />
                        <div>
                          <p className="text-sm text-gray-500">Difficulty</p>
                          <p className="font-medium capitalize">{recipe.difficulty}</p>
                        </div>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5 text-gray-700" />
                        <div>
                          <p className="text-sm text-gray-500">Servings</p>
                          <p className="font-medium">{recipe.servings}</p>
                        </div>
                      </div>
                    )}
                    {recipe.calories && (
                      <div className="flex items-center gap-2">
                        <BeakerIcon className="h-5 w-5 text-gray-700" />
                        <div>
                          <p className="text-sm text-gray-500">Calories</p>
                          <p className="font-medium">{recipe.calories}</p>
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
        {/* Ingredients and Instructions Container */}
        <div className="mt-16 sm:grid sm:grid-cols-3 sm:gap-12">
          {/* Ingredients */}
          <div className="prose max-w-none mb-12 sm:mb-0 sm:col-span-1">
            <h2 className="font-display text-2xl font-semibold mb-6">Ingredients</h2>
            <div className="mb-6">
              <UnitToggle />
            </div>

            <ul className="list-disc pl-5 space-y-4">
              {recipe.ingredients?.map((ingredient, index) => {
                const ingredientDetails = getIngredientById(ingredient.ingredientId);
                if (!ingredientDetails) return null;

                return (
                  <li key={index} className="text-gray-700">
                    <Ingredient
                      amount={ingredient.amount}
                      unit={ingredient.unit}
                      name={ingredientDetails.name}
                      defaultUnit={ingredientDetails.defaultUnit}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Method (formerly Instructions) */}
          <div className="prose max-w-none sm:col-span-2">
            <h2 className="font-display text-2xl font-semibold mb-6">Method</h2>
            <ol className="space-y-10">
              {recipe.steps?.map((step, index) => (
                <li key={index} className="flex items-start gap-6 text-gray-700">
                  <span className="flex items-center justify-center font-display text-2xl text-gray-900 
                                 bg-white rounded-full w-10 h-10 shadow-sm border border-gray-100 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="mt-1 prose prose-sm max-w-none"
                       dangerouslySetInnerHTML={{
                         __html: marked(typeof step === 'object' ? step.text : step)
                       }}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}