import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService';
import Layout from '../components/Layout';
import { ChevronLeftIcon, ClockIcon, ChartBarIcon, TagIcon, BeakerIcon } from '@heroicons/react/24/outline';

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

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

      {/* Hero Image */}
      <div className="relative h-96 rounded-xl overflow-hidden mb-8">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6">{recipe.title}</h1>

      {/* Recipe Info Panel */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center space-x-3">
          <ClockIcon className="h-6 w-6 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Prep Time</p>
            <p className="font-medium">{recipe.prepTime}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Difficulty</p>
            <p className="font-medium capitalize">{recipe.difficulty}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <TagIcon className="h-6 w-6 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{recipe.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <BeakerIcon className="h-6 w-6 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Calories</p>
            <p className="font-medium">{recipe.nutrition?.calories}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="prose max-w-none mb-8">
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        <p className="text-gray-700">{recipe.description}</p>
      </div>

      {/* Steps */}
      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps?.map((step, index) => (
            <li key={index} className="text-gray-700">
              {step}
            </li>
          ))}
        </ol>
      </div>
    </Layout>
  );
}