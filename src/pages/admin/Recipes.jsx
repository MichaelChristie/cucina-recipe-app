import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { getAllRecipes, addRecipe, updateRecipe, deleteRecipe } from '../../services/recipeService';
import { useAuth } from '../../contexts/AuthContext';
import { logOut } from '../../services/authService';

export default function Recipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const recipesData = await getAllRecipes();
      setRecipes(recipesData);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleOpenModal = (recipe = null) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setFormData({
        title: recipe.title,
        description: recipe.description,
        image: recipe.image || ''
      });
    } else {
      setEditingRecipe(null);
      setFormData({
        title: '',
        description: '',
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(null);
    setFormData({
      title: '',
      description: '',
      image: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title.trim()) {
        alert('Please enter a recipe title');
        return;
      }

      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, formData);
      } else {
        await addRecipe(formData);
      }
      
      handleCloseModal();
      await loadRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert(`Failed to ${editingRecipe ? 'update' : 'add'} recipe: ${error.message}`);
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
          onClick={() => handleOpenModal()}
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
              <tr key={recipe.id}>
                <td className="px-6 py-4 whitespace-nowrap">{recipe.title}</td>
                <td className="px-6 py-4">{recipe.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleOpenModal(recipe)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(recipe.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      {/* Recipe Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Recipe Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingRecipe ? 'Save Changes' : 'Add Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ... rest of the JSX from ManageRecipes ... */}
    </AdminLayout>
  );
} 