import { useEffect, useState, useCallback } from 'react';
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
import { getIngredients, addIngredient as addIngredientToDb } from '../../services/ingredientService';

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

const AVAILABLE_UNITS = [
  'g',     // grams
  'kg',    // kilograms
  'ml',    // milliliters
  'l',     // liters
  'tsp',   // teaspoon
  'tbsp',  // tablespoon
  'cup',   // cup
  'oz',    // ounce
  'lb',    // pound
  'whole', // whole units
  'clove', // for garlic
  'pinch', // for spices
  'slice', // for bread, etc
];

const AVAILABLE_CATEGORIES = [
  'Baking',
  'Dairy & Eggs',
  'Meat',
  'Seafood',
  'Vegetables',
  'Fruits',
  'Seasonings',
  'Oils',
  'Grains',
  'Condiments',
  'Liquids',
  'Nuts & Seeds'
];

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

function StickyFooter({ onSave, onClose, saving }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center py-4">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save & Close
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddIngredientModal({ isOpen, onClose, onAdd, initialName }) {
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: AVAILABLE_CATEGORIES[0],
    defaultUnit: AVAILABLE_UNITS[0],
    defaultAmount: ''
  });

  // Clear form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setNewIngredient({
        name: initialName || '',
        category: AVAILABLE_CATEGORIES[0],
        defaultUnit: AVAILABLE_UNITS[0],
        defaultAmount: ''
      });
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Modal - Submitting ingredient data:', newIngredient);
      const ingredientData = {
        ...newIngredient,
        defaultAmount: Number(newIngredient.defaultAmount)
      };
      console.log('Modal - Processed ingredient data:', ingredientData);

      const result = await onAdd(ingredientData);
      console.log('Modal - Result from onAdd:', result);
      
      if (!result) {
        throw new Error('Failed to add ingredient');
      }
      
      // Clear form
      setNewIngredient({
        name: '',
        category: AVAILABLE_CATEGORIES[0],
        defaultUnit: AVAILABLE_UNITS[0],
        defaultAmount: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast.error('Failed to add ingredient');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add New Ingredient</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={newIngredient.name}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                required
                value={newIngredient.category}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              >
                {AVAILABLE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Default Amount</label>
              <input
                type="number"
                required
                step="any"
                value={newIngredient.defaultAmount}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, defaultAmount: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Default Unit</label>
              <select
                required
                value={newIngredient.defaultUnit}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, defaultUnit: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              >
                {AVAILABLE_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Ingredient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [saving, setSaving] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);

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
        const newId = await addRecipe(cleanRecipe);
        window.history.replaceState(null, '', `/admin/recipes/${newId}/edit`);
        toast.success('Recipe created successfully');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe. Please try again.');
    }
  };

  const handleSave = async (e) => {
    setSaving(true);
    await handleSubmit(e);
    setSaving(false);
  };

  const handleSaveAndClose = async (e) => {
    setSaving(true);
    try {
      await handleSubmit(e);
      navigate('/admin/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setSaving(false);
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
        [field]: field === 'amount' ? parseFloat(value) || '' : value,
        ingredientId: newIngredients[index].ingredientId || newIngredients[index].id
      };
    }
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleIngredientSelect = (index, selectedIngredient) => {
    console.log('handleIngredientSelect - Input:', { index, selectedIngredient });
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      id: generateId(),
      name: selectedIngredient.name,
      ingredientId: selectedIngredient.id || selectedIngredient._id,
      unit: selectedIngredient.defaultUnit || '',
      amount: selectedIngredient.defaultAmount ? Number(selectedIngredient.defaultAmount) : '',
      confirmed: false
    };
    console.log('handleIngredientSelect - Updated ingredient:', newIngredients[index]);
    setRecipe({ ...recipe, ingredients: newIngredients });
    setActiveIngredient({ index: null, field: null });
  };

  const addIngredient = () => {
    const newIndex = recipe.ingredients.length;
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
    setTimeout(() => {
      document.querySelector(`#ingredient-${newIndex}`)?.focus();
    }, 0);
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

  const handleIngredientKeyDown = (e, index, filteredIngredients) => {
    const hasFilteredIngredients = filteredIngredients.length > 0;
    const showCreateOption = !hasFilteredIngredients && recipe.ingredients[index].name;
    const totalOptions = hasFilteredIngredients ? filteredIngredients.length : (showCreateOption ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          Math.min(prev + 1, totalOptions - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIngredient.field === 'name') {
          if (hasFilteredIngredients) {
            // Select existing ingredient
            handleIngredientSelect(index, filteredIngredients[selectedSuggestionIndex]);
            document.querySelector(`#amount-${index}`)?.focus();
          } else if (showCreateOption && selectedSuggestionIndex === 0) {
            // Create new ingredient
            setNewIngredientName(recipe.ingredients[index].name);
            setActiveIngredientIndex(index);
            setIsIngredientModalOpen(true);
          }
        } else if (activeIngredient.field === 'amount') {
          // Move to next ingredient or add new one
          const amount = recipe.ingredients[index].amount;
          if (amount && amount > 0) {
            if (index === recipe.ingredients.length - 1) {
              addIngredient();
            }
            // Focus the name input of the next ingredient
            setTimeout(() => {
              document.querySelector(`#ingredient-${index + 1}`)?.focus();
            }, 0);
          }
        }
        break;
      case 'Escape':
        setActiveIngredient({ index: null, field: null });
        setSelectedSuggestionIndex(0);
        break;
    }
  };

  const handleCreateIngredient = async (newIngredientData) => {
    try {
      console.log('handleCreateIngredient - Input data:', newIngredientData);

      const now = new Date();
      const ingredientData = {
        name: newIngredientData.name,
        category: newIngredientData.category,
        defaultUnit: newIngredientData.defaultUnit,
        defaultAmount: Number(newIngredientData.defaultAmount),
        createdAt: now,
        updatedAt: now
      };

      console.log('handleCreateIngredient - Prepared data:', ingredientData);

      const addedIngredient = await addIngredientToDb(ingredientData);
      
      console.log('handleCreateIngredient - Response from DB:', addedIngredient);
      
      if (!addedIngredient) {
        throw new Error('No response from addIngredient');
      }

      // Ensure we have the correct ID structure and timestamps
      const completeIngredient = {
        ...addedIngredient,
        id: addedIngredient.id || addedIngredient._id,
        ingredientId: addedIngredient.id || addedIngredient._id,
        defaultUnit: newIngredientData.defaultUnit,
        defaultAmount: Number(newIngredientData.defaultAmount),
        createdAt: now,
        updatedAt: now
      };

      console.log('handleCreateIngredient - Complete ingredient:', completeIngredient);

      setAvailableIngredients(prev => [...prev, completeIngredient]);
      
      // Use the stored activeIngredientIndex instead of activeIngredient.index
      console.log('handleCreateIngredient - Current editing index:', activeIngredientIndex);
      
      if (activeIngredientIndex !== null) {
        const newIngredients = [...recipe.ingredients];
        newIngredients[activeIngredientIndex] = {
          ...newIngredients[activeIngredientIndex],
          id: generateId(),
          name: completeIngredient.name,
          ingredientId: completeIngredient.id,
          unit: completeIngredient.defaultUnit || '',
          amount: completeIngredient.defaultAmount ? Number(completeIngredient.defaultAmount) : '',
          confirmed: false
        };
        console.log('handleCreateIngredient - Updated ingredient row:', newIngredients[activeIngredientIndex]);
        setRecipe({ ...recipe, ingredients: newIngredients });
      }

      return completeIngredient;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      toast.error('Failed to create ingredient');
      throw error;
    }
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
      <div className="pb-24">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                              <div className="flex-1 relative ingredient-field">
                                <input
                                  id={`ingredient-${index}`}
                                  type="text"
                                  value={ingredient.name || ''}
                                  onChange={(e) => {
                                    handleIngredientChange(index, 'name', e.target.value);
                                    setSelectedSuggestionIndex(0); // Reset selection on type
                                  }}
                                  onFocus={() => {
                                    setActiveIngredient({ index, field: 'name' });
                                    setSelectedSuggestionIndex(0);
                                  }}
                                  onKeyDown={(e) => {
                                    const filteredIngredients = availableIngredients.filter(ing => 
                                      ing.name.toLowerCase().includes(ingredient.name.toLowerCase())
                                    );
                                    handleIngredientKeyDown(e, index, filteredIngredients);
                                  }}
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
                                      .map((ing, suggestionIndex) => (
                                        <button
                                          key={ing.id}
                                          type="button"
                                          className={`w-full text-left px-4 py-2 ${
                                            selectedSuggestionIndex === suggestionIndex 
                                              ? 'bg-blue-50 text-blue-700' 
                                              : 'hover:bg-gray-100'
                                          }`}
                                          onClick={() => {
                                            handleIngredientSelect(index, ing);
                                            document.querySelector(`#amount-${index}`)?.focus();
                                          }}
                                          onMouseEnter={() => setSelectedSuggestionIndex(suggestionIndex)}
                                        >
                                          <span className="font-medium">{ing.name}</span>
                                          <span className="text-sm text-gray-500 ml-2">({ing.category})</span>
                                        </button>
                                      ))}
                                    {availableIngredients.filter(ing => 
                                      ing.name.toLowerCase().includes(ingredient.name.toLowerCase())
                                    ).length === 0 && (
                                      <div>
                                        <div className="px-4 py-2 text-gray-500 italic">
                                          No ingredients found
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNewIngredientName(ingredient.name);
                                            setActiveIngredientIndex(index);
                                            setIsIngredientModalOpen(true);
                                          }}
                                          onMouseEnter={() => setSelectedSuggestionIndex(0)}
                                          className={`w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium border-t
                                            ${selectedSuggestionIndex === 0 ? 'bg-blue-50' : ''}`}
                                        >
                                          + Create "{ingredient.name}"
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <input
                                id={`amount-${index}`}
                                type="number"
                                value={ingredient.amount || ''}
                                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                onFocus={() => setActiveIngredient({ index, field: 'amount' })}
                                onKeyDown={(e) => handleIngredientKeyDown(e, index, [])}
                                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 mx-2"
                                placeholder="Amount"
                                step="0.01"
                              />
                              <div className="relative ingredient-field w-32 mx-2">
                                <select
                                  value={ingredient.unit || ''}
                                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                  onFocus={() => setActiveIngredient({ index, field: 'unit' })}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                >
                                  <option value="">Select unit</option>
                                  {AVAILABLE_UNITS.map(unit => (
                                    <option key={unit} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
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
        </form>
      </div>
      <StickyFooter 
        onSave={handleSave}
        onClose={handleSaveAndClose}
        saving={saving}
      />
      <AddIngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onAdd={handleCreateIngredient}
        initialName={newIngredientName}
      />
    </AdminLayout>
  );
} 