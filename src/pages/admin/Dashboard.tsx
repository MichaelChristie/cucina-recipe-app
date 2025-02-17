import { FC, useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getRecipes, updateRecipe, deleteRecipe } from '../../services/recipeService';
import { PencilIcon, TrashIcon, DocumentDuplicateIcon, Bars3Icon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Recipe } from '../../types/recipe';
import { asRecipe } from '../../utils/typeGuards';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const recipesSnapshot = await getDocs(collection(db, 'recipes'));
        const fetchedRecipes = recipesSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Recipe, 'id'>;
          return {
            ...data,
            id: doc.id
          };
        });

        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        toast.error('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        toast.success('Recipe deleted successfully');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Failed to delete recipe');
      }
    }
  };

  const handleDuplicate = async (recipe: Recipe): Promise<void> => {
    try {
      const duplicatedRecipe: Partial<Recipe> = {
        title: `${recipe.title} (Copy)`,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tags: recipe.tags,
        position: recipe.position,
        image: recipe.image,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        featured: recipe.featured,
        nutrition: recipe.nutrition
      };
      await updateRecipe(recipe.id, duplicatedRecipe);
      toast.success('Recipe duplicated successfully');
      const recipesData = await getRecipes();
      const formattedRecipes = recipesData.map(recipe => asRecipe(recipe));
      setRecipes(formattedRecipes);
    } catch (error) {
      console.error('Error duplicating recipe:', error);
      toast.error('Failed to duplicate recipe');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(recipes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((recipe, index) => {
      const recipeData = recipe as Recipe;
      return {
        ...recipeData,
        position: index + 1
      };
    });

    setRecipes(updatedItems);

    try {
      await Promise.all(
        updatedItems.map(recipe => 
          updateRecipe(recipe.id, { position: recipe.position })
        )
      );
      toast.success('Recipe order updated successfully');
    } catch (error) {
      console.error('Error updating recipe positions:', error);
      toast.error('Failed to update recipe order');
      const recipesData = await getRecipes();
      const formattedRecipes = recipesData.map(recipe => asRecipe(recipe));
      setRecipes(formattedRecipes);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-olive-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-olive-600">Total Recipes</h3>
            <p className="text-3xl font-bold text-olive-600">{recipes.length}</p>
            <Link to="/admin/recipes" className="text-olive-600 hover:underline">View Recipes</Link>
            <div className="mt-4">
              <div className="h-32 flex items-end space-x-2">
                <div className="w-8 bg-olive-600/30 h-[30%]"></div>
                <div className="w-8 bg-olive-600/40 h-[50%]"></div>
                <div className="w-8 bg-olive-600/50 h-[40%]"></div>
                <div className="w-8 bg-olive-600/60 h-[75%]"></div>
                <div className="w-8 bg-olive-600/70 h-[60%]"></div>
                <div className="w-8 bg-olive-600/80 h-[80%]"></div>
              </div>
              <div className="flex justify-between text-xs text-olive-600 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
            </div>
          </div>
          <div className="bg-earthgreen-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-earthgreen-600">Active Users</h3>
            <p className="text-3xl font-bold text-earthgreen-600">456</p>
            <Link to="/admin/users" className="text-earthgreen-600 hover:underline">View Users</Link>
            <div className="mt-4">
              <div className="h-32 flex items-end space-x-2">
                <div className="w-8 bg-earthgreen-600/30 h-[20%]"></div>
                <div className="w-8 bg-earthgreen-600/40 h-[45%]"></div>
                <div className="w-8 bg-earthgreen-600/50 h-[35%]"></div>
                <div className="w-8 bg-earthgreen-600/60 h-[70%]"></div>
                <div className="w-8 bg-earthgreen-600/70 h-[55%]"></div>
                <div className="w-8 bg-earthgreen-600/80 h-[85%]"></div>
              </div>
              <div className="flex justify-between text-xs text-earthgreen-600 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
            </div>
          </div>
          <div className="bg-cookred-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-cookred-600">Total Views</h3>
            <p className="text-3xl font-bold text-cookred-600">789</p>
            <Link to="/admin/views" className="text-cookred-600 hover:underline">View Views</Link>
            <div className="mt-4">
              <div className="h-32 flex items-end space-x-2">
                <div className="w-8 bg-cookred-600/30 h-[40%]"></div>
                <div className="w-8 bg-cookred-600/40 h-[60%]"></div>
                <div className="w-8 bg-cookred-600/50 h-[45%]"></div>
                <div className="w-8 bg-cookred-600/60 h-[80%]"></div>
                <div className="w-8 bg-cookred-600/70 h-[65%]"></div>
                <div className="w-8 bg-cookred-600/80 h-[90%]"></div>
              </div>
              <div className="flex justify-between text-xs text-cookred-600 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Recipes</h2>
          <button
            onClick={() => navigate('/admin/recipes/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Recipe
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="recipes">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="bg-white shadow-sm rounded-lg overflow-hidden"
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-10"></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipes.slice(0, 5).map((recipe, index) => (
                      <Draggable 
                        key={recipe.id} 
                        draggableId={recipe.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging ? 'bg-blue-50' : 'hover:bg-gray-50'
                            } transition-colors duration-150`}
                          >
                            <td className="pl-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move p-2 hover:bg-gray-100 rounded inline-block"
                              >
                                <Bars3Icon className="h-5 w-5 text-gray-500" />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                              <button 
                                onClick={() => navigate(`/admin/recipes/${recipe.id}/edit`)}
                                className="font-medium text-gray-900 hover:text-blue-600 text-left"
                              >
                                {recipe.title}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-md">
                              <p className="truncate">{recipe.description}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => window.open(`/recipe/${recipe.id}`, '_blank')}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Preview recipe"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => navigate(`/admin/recipes/${recipe.id}/edit`)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit recipe"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDuplicate(recipe)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Duplicate recipe"
                                >
                                  <DocumentDuplicateIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(recipe.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete recipe"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                </table>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <div className="mt-4 text-right">
          <Link 
            to="/admin/recipes" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Recipes →
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 