import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marked } from 'marked';
import {
  ChevronLeftIcon,
  ClockIcon,
  ChartBarIcon,
  TagIcon,
  BeakerIcon,
  FireIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Layout from "../components/Layout";
import UnitToggle from "../components/UnitToggle";
import Ingredient from "../components/Ingredient";
import { Recipe, Tag } from "../types/admin";
import { getRecipeById } from "../services/recipeService";
import { getTags } from "../services/tagService";
import { getIngredients } from '../services/ingredientService';

interface RecipeDetailsProps {}

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

const RecipeDetails: FC<RecipeDetailsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      try {
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

  const getIngredientById = (ingredientId: string) => {
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

      {/* Rest of your JSX remains the same, just with proper TypeScript types */}
      {/* ... */}
    </Layout>
  );
};

export default RecipeDetails; 