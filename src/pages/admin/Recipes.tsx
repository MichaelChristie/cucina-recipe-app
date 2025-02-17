import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, DocumentDuplicateIcon, Bars3Icon, PencilIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { Recipe, Difficulty } from '../../types/recipe';
import { getRecipes, addRecipe, deleteRecipe, updateRecipe } from '../../services/recipeService';
import { logOut } from '../../services/authService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

type RecipeWithId = Pick<Recipe, 'id' | 'title' | 'description' | 'ingredients' | 'steps' | 'tags' | 'position' | 'image' | 'prepTime' | 'cookTime' | 'difficulty' | 'servings' | 'featured' | 'nutrition'>;

const Recipes: FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeWithId[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async (): Promise<void> => {
    try {
      const recipesData = await getRecipes();
      const sortedRecipes = recipesData
        .map((recipe: Recipe): RecipeWithId => ({
          id: recipe.id,
          title: recipe.title,
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
        }))
        .sort((a, b) => (a.position || Number.MAX_VALUE) - (b.position || Number.MAX_VALUE));
      setRecipes(sortedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        toast.success('Recipe deleted successfully');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error(`Failed to delete recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logOut();
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleExport = async (recipe: RecipeWithId): Promise<void> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(recipe, null, 2));
      toast.success('Recipe JSON copied to clipboard');
      console.log('Recipe exported:', recipe);
    } catch (error) {
      console.error('Error exporting recipe:', error);
      toast.error('Failed to export recipe');
    }
  };

  const handleDuplicate = async (recipe: RecipeWithId): Promise<void> => {
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
      await loadRecipes();
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

    const updatedItems = items.map((recipe, index) => ({
      ...recipe,
      position: index + 1
    }));

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
      await loadRecipes();
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
                    {recipes.map((recipe, index) => (
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
      </div>
    </AdminLayout>
  );
};

export default Recipes; 