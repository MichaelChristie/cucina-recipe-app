import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getRecipeById, updateRecipe, addRecipe } from '../../services/recipeService';
import AdminLayout from '../../components/AdminLayout';
import { ChevronLeftIcon, ClockIcon, ChartBarIcon, TagIcon, BeakerIcon, Bars3Icon, PlusIcon, TrashIcon, CheckIcon, UserGroupIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { 
  MDXEditor, 
  toolbarPlugin, 
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  UndoRedo,
  markdownShortcutPlugin,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  imagePlugin
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { getTags } from '../../services/tagService';
import { getIngredients } from '../../services/ingredientService';

const UNITS = {
  weight: {
    metric: ['gram', 'kilogram'],
    imperial: ['ounce', 'pound'],
  },
  volume: {
    metric: ['milliliter', 'liter'],
    imperial: ['fluid_ounce', 'cup'],
  },
  other: ['teaspoon', 'tablespoon', 'pinch', 'piece', 'whole', 'clove']
};

const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

const editorStyles = {
  '.mdxeditor': {
    position: 'relative',
    zIndex: 20,
  },
  '.toolbar-container': {
    opacity: 0,
    maxHeight: 0,
    padding: 0,
    margin: 0,
    border: 'none',
    transition: 'all 0.2s ease-in-out',
    visibility: 'hidden',
    position: 'absolute',
    background: 'white',
    width: '100%',
    zIndex: 100,
  },
  '.toolbar-container.active': {
    opacity: 1,
    maxHeight: '200px',
    padding: '0.5rem',
    visibility: 'visible',
    position: 'static',
    zIndex: 1000,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    borderRadius: '0.375rem',
  }
};

export default function RecipeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    image: '',
    prepTime: '',
    cookTime: '',
    difficulty: 'easy',
    category: '',
    nutrition: { 
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    ingredients: [],
    steps: [],
    tags: [],
    showTagsPanel: false
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [tags, setTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [activeIngredient, setActiveIngredient] = useState({ index: null, field: null });

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        try {
          const data = await getRecipeById(id);
          if (!data) {
            throw new Error('No data received');
          }
          
          const ingredientsWithIds = data.ingredients?.map(ing => ({
            ...ing,
            id: ing.id || generateId()
          })) || [];

          setRecipe({
            ...data,
            ingredients: ingredientsWithIds,
            tags: data.tags || []
          });
        } catch (error) {
          console.error('Error fetching recipe:', error);
          toast.error('Failed to load recipe');
        } finally {
          setLoading(false);
        }
      };
      fetchRecipe();
    }
  }, [id]);

  useEffect(() => {
    const loadTags = async () => {
      const fetchedTags = await getTags();
      setTags(fetchedTags);
    };
    loadTags();
  }, []);

  useEffect(() => {
    const loadIngredients = async () => {
      const ingredients = await getIngredients();
      setAvailableIngredients(ingredients);
    };
    loadIngredients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.ingredient-field')) {
        setActiveIngredient({ index: null, field: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!recipe.title.trim()) {
        toast.error('Title is required');
        return;
      }

      // Validate ingredients have IDs
      const hasInvalidIngredients = recipe.ingredients?.some(
        ing => !ing.ingredientId
      );
      
      if (hasInvalidIngredients) {
        toast.error('All ingredients must be selected from the suggestion list');
        return;
      }

      const cleanRecipe = {
        ...recipe,
        tags: recipe.tags || [],
        nutrition: recipe.nutrition || { calories: '' },
        ingredients: recipe.ingredients?.map(ing => ({
          ingredientId: ing.ingredientId,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit
        })) || [],
        steps: recipe.steps || []
      };

      if (id) {
        await updateRecipe(id, cleanRecipe);
        toast.success('Recipe updated successfully');
      } else {
        await addRecipe(cleanRecipe);
        toast.success('Recipe created successfully');
      }
      navigate('/admin/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe. Please try again.');
    }
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...recipe.steps];
    if (typeof newSteps[index] === 'string') {
      newSteps[index] = { text: newSteps[index], confirmed: false };
    }
    newSteps[index] = { 
      ...newSteps[index], 
      [field]: value 
    };
    setRecipe({ ...recipe, steps: newSteps });
  };

  const addStep = () => {
    setRecipe({ 
      ...recipe, 
      steps: [...recipe.steps, { text: '', confirmed: false }] 
    });
  };

  const removeStep = (index) => {
    const newSteps = recipe.steps.filter((_, i) => i !== index);
    setRecipe({ ...recipe, steps: newSteps });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredients];
    if (field === 'name') {
      newIngredients[index] = {
        ...newIngredients[index],
        name: value,
        ingredientId: ''
      };
    } else {
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: field === 'amount' ? parseFloat(value) || '' : value
      };
    }
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleIngredientSelect = (index, selectedIngredient) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      name: selectedIngredient.name,
      ingredientId: selectedIngredient.id,
      unit: selectedIngredient.defaultUnit || 'gram',
      amount: newIngredients[index].amount || ''
    };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...(recipe.ingredients || []), { 
        id: generateId(),
        name: '', 
        amount: '', 
        unit: '',
        ingredientId: '',
        confirmed: false
      }]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(recipe.ingredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setRecipe({ ...recipe, ingredients: items });
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
          <label className="text-xl font-bold text-gray-900 mb-4">Title</label>
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            required
          />
        </div>

        {/* Tags Selection */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => setRecipe(prev => ({ ...prev, showTagsPanel: !prev.showTagsPanel }))}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <TagIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags?.length > 0 ? (
                    tags
                      .filter(tag => recipe.tags.includes(tag.id))
                      .map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-sm rounded-full"
                        >
                          <span>{tag.emoji}</span>
                          <span>{tag.name}</span>
                        </span>
                      ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No tags selected</span>
                  )}
                </div>
              </div>
              <ChevronRightIcon 
                className={`h-5 w-5 text-gray-400 transform transition-transform ${
                  recipe.showTagsPanel ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Tags Panel */}
            {recipe.showTagsPanel && (
              <div className="px-4 pb-4">
                {/* Tag Categories Grid */}
                <div className="grid grid-cols-5 gap-4 mb-4">
                  {Object.entries(
                    tags.reduce((acc, tag) => {
                      if (!acc[tag.category]) acc[tag.category] = [];
                      acc[tag.category].push(tag);
                      return acc;
                    }, {})
                  ).map(([category, categoryTags]) => (
                    <div key={category} className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">{category}</h3>
                      <div className="space-y-1">
                        {categoryTags.map((tag) => (
                          <label
                            key={tag.id}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={recipe.tags?.includes(tag.id)}
                              onChange={(e) => {
                                const newTags = e.target.checked
                                  ? [...(recipe.tags || []), tag.id]
                                  : (recipe.tags || []).filter(id => id !== tag.id);
                                setRecipe({ ...recipe, tags: newTags });
                              }}
                              className="rounded border-gray-300 text-tasty-green focus:ring-tasty-green"
                            />
                            <span className="w-6 text-center">{tag.emoji}</span>
                            <span className="text-sm text-gray-700">{tag.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="text-xl font-bold text-gray-900 mb-4">Image URL</label>
          <input
            type="text"
            value={recipe.image}
            onChange={(e) => setRecipe({ ...recipe, image: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
          />

        </div>

        {/* Recipe Info Panel */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Atrributes</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prep Time</label>
            <input
              type="text"
              value={recipe.prepTime}
              onChange={(e) => setRecipe({ ...recipe, prepTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cook Time</label>
            <input
              type="text"
              value={recipe.cookTime}
              onChange={(e) => setRecipe({ ...recipe, cookTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              value={recipe.difficulty}
              onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Servings</label>
            <input
              type="number"
              min="1"
              value={recipe.servings || ''}
              onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) || '' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              placeholder="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories</label>
            <input
              type="text"
              value={recipe.nutrition?.calories || ''}
              onChange={(e) => setRecipe({ 
                ...recipe, 
                nutrition: { 
                  ...recipe.nutrition, 
                  calories: e.target.value 
                } 
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
          </div>
        </div>

        {/* Description */}
        <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <textarea
            value={recipe.description}
            onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
          />
        </div>

        {/* Ingredients */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="ingredients-list" type="ingredient">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {recipe.ingredients?.map((ingredient, index) => (
                      <Draggable 
                        key={ingredient.id}
                        draggableId={ingredient.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex gap-2 items-center ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move p-2 hover:bg-gray-100 rounded"
                            >
                              <Bars3Icon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                              type="number"
                              value={ingredient.amount || ''}
                              onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                              placeholder="Amount"
                              step="0.01"
                            />
                            <div className="relative ingredient-field w-32">
                              <select
                                value={ingredient.unit || 'gram'}
                                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                onFocus={() => setActiveIngredient({ index, field: 'unit' })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                              >
                                <optgroup label="Weight - Metric">
                                  {UNITS.weight.metric.map(unit => (
                                    <option key={unit} value={unit}>
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Weight - Imperial">
                                  {UNITS.weight.imperial.map(unit => (
                                    <option key={unit} value={unit}>
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Volume - Metric">
                                  {UNITS.volume.metric.map(unit => (
                                    <option key={unit} value={unit}>
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Volume - Imperial">
                                  {UNITS.volume.imperial.map(unit => (
                                    <option key={unit} value={unit}>
                                      {unit.charAt(0).toUpperCase() + unit.slice(1).replace('_', ' ')}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Other">
                                  {UNITS.other.map(unit => (
                                    <option key={unit} value={unit}>
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                            <div className="flex-1 relative ingredient-field">
                              <input
                                type="text"
                                value={ingredient.name || ''}
                                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                onFocus={() => setActiveIngredient({ index, field: 'name' })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                                placeholder="Start typing ingredient name..."
                              />
                              {activeIngredient.index === index && 
                               activeIngredient.field === 'name' && 
                               ingredient.name && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                  {availableIngredients
                                    .filter(ing => 
                                      ing.name.toLowerCase().includes(ingredient.name.toLowerCase())
                                    )
                                    .map(ing => (
                                      <button
                                        key={ing.id}
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                                        onClick={() => handleIngredientSelect(index, ing)}
                                      >
                                        <span className="font-medium">{ing.name}</span>
                                        <span className="text-sm text-gray-500 ml-2">({ing.category})</span>
                                      </button>
                                    ))}
                                  {availableIngredients.filter(ing => 
                                    ing.name.toLowerCase().includes(ingredient.name.toLowerCase())
                                  ).length === 0 && (
                                    <div className="px-4 py-2 text-gray-500 italic">
                                      No ingredients found
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleIngredientChange(index, 'confirmed', !ingredient.confirmed)}
                              className={`p-2 rounded-full ${ingredient.confirmed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} hover:bg-opacity-80`}
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Ingredient
            </button>
          </div>
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            {recipe.steps?.map((step, index) => (
              <div key={index} className="flex gap-6 mb-6 items-start">
                <span className="flex items-center justify-center font-display text-3xl text-tasty-green 
                  bg-white rounded-full w-12 h-12 shadow-sm border border-tasty-green/10 flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 group">
                  <MDXEditor
                    markdown={step.text || ''}
                    onChange={(value) => handleStepChange(index, 'text', value)}
                    className="prose max-w-none"
                    placeholder={`Step ${index + 1}`}
                    contentEditableClassName="min-h-[4rem] p-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    style={editorStyles}
                    plugins={[
                      toolbarPlugin({
                        toolbarContents: () => (
                          <div 
                            className="flex flex-wrap gap-0.5"
                            onFocus={(e) => {
                              e.currentTarget.closest('.toolbar-container')?.classList.add('active');
                            }}
                            onBlur={(e) => {
                              e.currentTarget.closest('.toolbar-container')?.classList.remove('active');
                            }}
                          >
                            <UndoRedo />
                            <BoldItalicUnderlineToggles />
                            <ListsToggle />
                            <BlockTypeSelect />
                            <CreateLink />
                            <InsertImage />
                          </div>
                        )
                      }),
                      listsPlugin(),
                      markdownShortcutPlugin(),
                      quotePlugin(),
                      headingsPlugin(),
                      linkPlugin(),
                      imagePlugin()
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleStepChange(index, 'confirmed', !step.confirmed)}
                    className={`p-2 rounded-full ${step.confirmed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} hover:bg-opacity-80`}
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addStep}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Step
            </button>
          </div>
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