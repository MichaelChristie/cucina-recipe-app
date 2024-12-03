import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById, updateRecipe, addRecipe } from '../../services/recipeService';
import AdminLayout from '../../components/AdminLayout';
import { ChevronLeftIcon, ClockIcon, ChartBarIcon, TagIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function RecipeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    image: '',
    prepTime: '',
    difficulty: 'easy',
    category: '',
    nutrition: { calories: '' },
    steps: []
  });
  const [loading, setLoading] = useState(id ? true : false);

  useEffect(() => {
    if (id) {
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
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateRecipe(id, recipe);
        toast.success('Recipe updated successfully');
      } else {
        await addRecipe(recipe);
        toast.success('Recipe created successfully');
      }
      navigate('/admin/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...recipe.steps];
    newSteps[index] = value;
    setRecipe({ ...recipe, steps: newSteps });
  };

  const addStep = () => {
    setRecipe({ ...recipe, steps: [...recipe.steps, ''] });
  };

  const removeStep = (index) => {
    const newSteps = recipe.steps.filter((_, i) => i !== index);
    setRecipe({ ...recipe, steps: newSteps });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 mb-4">
          <button
            type="button"
            onClick={() => navigate('/admin/recipes')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Admin</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Recipes</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{id ? 'Edit Recipe' : 'New Recipe'}</span>
        </nav>

          {/* Image Preview */}
          {recipe.image && (
            <div className="mt-2 relative h-48 rounded-lg overflow-hidden">
              <img
                src={recipe.image}
                alt="Recipe preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}


        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="text"
            value={recipe.image}
            onChange={(e) => setRecipe({ ...recipe, image: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />

        </div>

        {/* Recipe Info Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prep Time</label>
            <input
              type="text"
              value={recipe.prepTime}
              onChange={(e) => setRecipe({ ...recipe, prepTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              value={recipe.difficulty}
              onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={recipe.category}
              onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories</label>
            <input
              type="text"
              value={recipe.nutrition?.calories}
              onChange={(e) => setRecipe({ ...recipe, nutrition: { ...recipe.nutrition, calories: e.target.value } })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={recipe.description}
            onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Instructions</label>
          {recipe.steps?.map((step, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Step ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Add Step
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {id ? 'Save Changes' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
} 