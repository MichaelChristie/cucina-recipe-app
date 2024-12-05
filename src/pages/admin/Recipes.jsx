import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { getRecipes, addRecipe, updateRecipe, deleteRecipe } from '../../services/recipeService';
import { useAuth } from '../../contexts/AuthContext';
import { logOut } from '../../services/authService';

export default function Recipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const recipesData = await getRecipes();
      setRecipes(recipesData);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        await loadRecipes();
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert(`Failed to delete recipe: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <AdminLayout>
<div className="bg-white shadow-sm rounded-lg p-6">


      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Recipes</h1>
        <button
          onClick={() => navigate('/admin/recipes/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Recipe
        </button>
      </div>
      {/* Recipe List Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recipes.map((recipe) => (
              <tr 
                key={recipe.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{recipe.title}</td>
                <td className="px-6 py-4 text-gray-600 max-w-md">
                  <p className="truncate">{recipe.description}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/admin/recipes/edit/${recipe.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        handleDelete(recipe.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </AdminLayout>
  );
} 