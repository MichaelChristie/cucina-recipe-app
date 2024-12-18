import { FC, useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverlay
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableIngredient from '../../components/Recipe/SortableIngredient';
import { CSS } from '@dnd-kit/utilities';
import { getRecipeById, updateRecipe, addRecipe } from '../../services/recipeService';
import AdminLayout from '../../components/AdminLayout';
import { 
  ChevronLeftIcon, TagIcon, 
  Bars3Icon, PlusIcon, TrashIcon, CheckIcon, ChevronRightIcon 
} from '@heroicons/react/24/outline';
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
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { getTags } from '../../services/tagService';
import { getIngredients, addIngredient as addIngredientToDb } from '../../services/ingredientService';
import { EditorRecipe, EditorIngredient, StickyFooterProps, AddIngredientModalProps } from '../../types/editor';
import { Tag, Ingredient } from '../../types/admin';
import { uploadMedia } from '../../services/storageService';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import SortableTestItem from '../../components/Recipe/SortableTestItem';

// Constants remain the same
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
] as const;

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
] as const;

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
} as const;

const generateId = (): string => `_${Math.random().toString(36).substr(2, 9)}`;

// Component type definitions
const StickyFooter: FC<StickyFooterProps> = ({ onSave, onClose, saving }) => {
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
};

const AddIngredientModal: FC<AddIngredientModalProps> = ({ isOpen, onClose, onAdd, initialName }) => {
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    category: AVAILABLE_CATEGORIES[0],
    defaultUnit: AVAILABLE_UNITS[0],
    defaultAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  useEffect(() => {
    if (isOpen) {
      setNewIngredient({
        name: initialName || '',
        category: AVAILABLE_CATEGORIES[0],
        defaultUnit: AVAILABLE_UNITS[0],
        defaultAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await onAdd(newIngredient);
      if (!result) {
        throw new Error('Failed to add ingredient');
      }
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
          {/* Form fields */}
          <div className="space-y-4">
            {/* Name field */}
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

            {/* Category field */}
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

            {/* Default Amount field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Amount</label>
              <input
                type="number"
                required
                step="any"
                value={newIngredient.defaultAmount}
                onChange={(e) => setNewIngredient(prev => ({ 
                  ...prev, 
                  defaultAmount: parseFloat(e.target.value) || 0 
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              />
            </div>

            {/* Default Unit field */}
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

          {/* Form buttons */}
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
};

// Add this interface near the top with other interfaces/types
interface TestItem {
  id: string;
  content: string;
}

const RecipeEditor: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<EditorRecipe>({
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
    showTagsPanel: false,
    authorId: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [loading, setLoading] = useState(id ? true : false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [activeIngredient, setActiveIngredient] = useState<{ 
    index: number | null; 
    field: keyof EditorIngredient | null; 
  }>({ index: null, field: null });
  const [saving, setSaving] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { user } = useAuth();
  const [testItems, setTestItems] = useState<TestItem[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' },
  ]);
  const ingredientsContainerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.ingredient-field')) {
        setActiveIngredient({ index: null, field: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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

  const handleSave = async (e: React.MouseEvent): Promise<void> => {
    setSaving(true);
    await handleSubmit(e);
    setSaving(false);
  };

  const handleSaveAndClose = async (e: React.MouseEvent): Promise<void> => {
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

  const handleStepChange = (index: number, field: string, value: string): void => {
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

  const addStep = (): void => {
    setRecipe({ 
      ...recipe, 
      steps: [...recipe.steps, { text: '', confirmed: false }] 
    });
  };

  const removeStep = (index: number): void => {
    const newSteps = recipe.steps.filter((_, i) => i !== index);
    setRecipe({ ...recipe, steps: newSteps });
  };

  const handleIngredientChange = (index: number, field: keyof EditorIngredient, value: string | number | boolean): void => {
    const newIngredients = [...recipe.ingredients];
    if (field === 'name') {
      newIngredients[index] = {
        ...newIngredients[index],
        name: value as string,
        ingredientId: ''
      };
    } else {
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: field === 'amount' ? parseFloat(value as string) || '' : value,
        ingredientId: newIngredients[index].ingredientId || newIngredients[index].id
      };
    }
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleIngredientSelect = (index: number, selectedIngredient: Ingredient): void => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      id: generateId(),
      name: selectedIngredient.name,
      ingredientId: selectedIngredient.id,
      unit: selectedIngredient.defaultUnit || '',
      amount: selectedIngredient.defaultAmount ? Number(selectedIngredient.defaultAmount) : '',
      confirmed: false
    };
    setRecipe({ ...recipe, ingredients: newIngredients });
    setActiveIngredient({ index: null, field: null });
  };

  const addIngredient = (): void => {
    const newIngredient = {
      id: generateId(),
      name: '',
      amount: '',
      unit: '',
      ingredientId: '',
      confirmed: false
    };
    
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const removeIngredient = (index: number): void => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleIngredientDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = recipe.ingredients.findIndex(ing => ing.id === active.id);
      const newIndex = recipe.ingredients.findIndex(ing => ing.id === over.id);

      console.log('Moving ingredient:', {
        from: oldIndex,
        to: newIndex,
        activeId: active.id,
        overId: over.id
      });

      if (oldIndex !== -1 && newIndex !== -1) {
        const newIngredients = arrayMove(recipe.ingredients, oldIndex, newIndex);
        setRecipe(prev => ({
          ...prev,
          ingredients: newIngredients
        }));
      }
    }
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent, index: number, filteredIngredients: Ingredient[]): void => {
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
            handleIngredientSelect(index, filteredIngredients[selectedSuggestionIndex]);
            document.querySelector(`#amount-${index}`)?.focus();
          } else if (showCreateOption && selectedSuggestionIndex === 0) {
            setNewIngredientName(recipe.ingredients[index].name);
            setActiveIngredientIndex(index);
            setIsIngredientModalOpen(true);
          }
        } else if (activeIngredient.field === 'amount') {
          const amount = recipe.ingredients[index].amount;
          if (amount && amount > 0) {
            if (index === recipe.ingredients.length - 1) {
              addIngredient();
            }
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

  const handleCreateIngredient = async (newIngredientData: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    try {
      const now = new Date();
      const ingredientData = {
        name: newIngredientData.name,
        category: newIngredientData.category,
        defaultUnit: newIngredientData.defaultUnit,
        defaultAmount: Number(newIngredientData.defaultAmount),
        createdAt: now,
        updatedAt: now
      };

      const addedIngredient = await addIngredientToDb(ingredientData);
      
      if (!addedIngredient) {
        throw new Error('No response from addIngredient');
      }

      const completeIngredient = {
        ...addedIngredient,
        id: addedIngredient.id || addedIngredient._id,
        ingredientId: addedIngredient.id || addedIngredient._id,
        defaultUnit: newIngredientData.defaultUnit,
        defaultAmount: Number(newIngredientData.defaultAmount),
        createdAt: now,
        updatedAt: now
      };

      setAvailableIngredients(prev => [...prev, completeIngredient]);
      
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
        setRecipe({ ...recipe, ingredients: newIngredients });
      }

      return completeIngredient;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      toast.error('Failed to create ingredient');
      throw error;
    }
  };

  const handleMediaUpload = async (file: File) => {
    try {
      const downloadUrl = await uploadMedia(
        file,
        `recipes/${recipe.id || 'new'}/media`,
        ({ progress, error }) => {
          if (error) {
            toast.error('Upload failed');
            return;
          }
          setUploadProgress(progress);
        }
      );

      // Update recipe with new media URL
      setRecipe(prev => ({
        ...prev,
        image: downloadUrl
      }));

      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast.error('You must be logged in to upload images');
      return;
    }

    try {
      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      const storageRef = ref(
        storage, 
        `recipes/${recipe.id || 'new'}/${uniqueFileName}`
      );
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload image');
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setRecipe(prev => ({
              ...prev,
              image: downloadURL
            }));
            setUploadProgress(0);
            toast.success('Image uploaded successfully');
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to complete image upload');
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (!imageFile) {
      toast.error('Please drop an image file');
      return;
    }

    await handleImageUpload({ target: { files: [imageFile] } } as any);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTestDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    setTestItems((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = recipe.ingredients.findIndex(ing => ing.id === active.id);
      const newIndex = recipe.ingredients.findIndex(ing => ing.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newIngredients = [...recipe.ingredients];
        const [movedItem] = newIngredients.splice(oldIndex, 1);
        newIngredients.splice(newIndex, 0, movedItem);

        setRecipe(prev => ({
          ...prev,
          ingredients: newIngredients
        }));
      }
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    console.log('Drag moving:', event);
  };

  useEffect(() => {
    console.log('Recipe ingredients updated:', 
      recipe.ingredients.map((ing, idx) => ({
        index: idx,
        id: ing.id,
        tempId: `temp-${ing.id}`,
        name: ing.name
      }))
    );
  }, [recipe.ingredients]);

  useEffect(() => {
    console.log('Current ingredients:', recipe.ingredients.map(ing => ({
      id: ing.id,
      name: ing.name
    })));
  }, [recipe.ingredients]);

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
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Image
            </label>
            <div className="flex items-start space-x-4">
              <div 
                className="relative group"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {recipe.image ? (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                    <img
                      src={recipe.image}
                      alt="Recipe preview"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay with persistent buttons */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50">
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <label
                          htmlFor="image-upload"
                          className="p-1.5 bg-white/90 hover:bg-white text-blue-600 rounded-full cursor-pointer transition-colors duration-200"
                        >
                          <PlusIcon className="h-4 w-4" />
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setRecipe(prev => ({ ...prev, image: '' }))}
                          className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-full transition-colors duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm text-white/75">
                        <p className="bg-black/50 px-2 py-1 rounded">
                          Drop image to replace
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200 ease-in-out">
                    <div className="text-center p-4">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="mt-4">
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload an image</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            or drag and drop
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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

          {/* Ingredients */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={recipe.ingredients.map(ing => ing.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {recipe.ingredients.map((ingredient, index) => (
                    <SortableIngredient
                      key={ingredient.id}
                      ingredient={ingredient}
                      index={index}
                      onNameChange={handleIngredientChange}
                      onAmountChange={handleIngredientChange}
                      onUnitChange={handleIngredientChange}
                      onConfirmChange={handleIngredientChange}
                      onRemove={removeIngredient}
                      activeIngredient={activeIngredient}
                      setActiveIngredient={setActiveIngredient}
                      selectedSuggestionIndex={selectedSuggestionIndex}
                      availableIngredients={availableIngredients}
                      handleIngredientSelect={handleIngredientSelect}
                      handleIngredientKeyDown={handleIngredientKeyDown}
                    />
                  ))}
                </div>
              </SortableContext>
              
              {/* Add DragOverlay for better visual feedback */}
              <DragOverlay>
                {activeId ? (
                  <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
                    {recipe.ingredients.find(ing => ing.id === activeId)?.name}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Add Ingredient button */}
            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Ingredient
            </button>
          </div>

          {/* Test list with its own DndContext */}
          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Sortable List</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleTestDragEnd}
            >
              <SortableContext
                items={testItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {testItems.map((item) => (
                    <SortableTestItem
                      key={item.id}
                      id={item.id}
                      content={item.content}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Steps */}
          <div className="mt-6">
            <div className="space-y-4">
              {recipe.steps?.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <MDXEditor
                      markdown={step.text || ''}
                      onChange={(content) => handleStepChange(index, 'text', content)}
                      plugins={[
                        toolbarPlugin({
                          toolbarContents: () => (
                            <>
                              <BoldItalicUnderlineToggles />
                              <ListsToggle />
                              <BlockTypeSelect />
                              <CreateLink />
                              <InsertImage />
                              <UndoRedo />
                            </>
                          )
                        }),
                        markdownShortcutPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        headingsPlugin(),
                        linkPlugin(),
                        imagePlugin()
                      ]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
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
      </div>
    </AdminLayout>
  );
};

export default RecipeEditor; 