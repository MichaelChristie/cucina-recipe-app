import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getRecipeById, updateRecipe, addRecipe } from '../../services/recipeService';
import AdminLayout from '../../components/AdminLayout';
import { 
  ChevronLeftIcon, TagIcon, 
  Bars3Icon, PlusIcon, TrashIcon, CheckIcon, ChevronRightIcon, PencilIcon 
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
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/config';

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

interface ImageUploadProps {
  image: string;
  onImageChange: (url: string) => void;
  className?: string;
}

interface UploadProgressProps {
  progress: number;
}

const UploadProgress: FC<UploadProgressProps> = ({ progress }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-8 h-8">
        <circle
          className="text-gray-200"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
        <circle
          className="text-blue-600"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
      </svg>
      <span className="absolute text-xs">{Math.round(progress)}%</span>
    </div>
  );
};

const ImageUpload: FC<ImageUploadProps> = ({ image, onImageChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `recipe-images/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onImageChange(downloadURL);
          toast.success('Image uploaded successfully');
        } catch (error) {
          console.error('Error getting download URL:', error);
          toast.error('Failed to process uploaded image');
        }
        setIsUploading(false);
      }
    );
  };

  const handleDelete = async () => {
    if (!image) return;

    try {
      const imageRef = ref(storage, image);
      await deleteObject(imageRef);
      onImageChange('');
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {image ? (
        // Image preview container
        <div className="relative h-48 rounded-lg overflow-hidden group">
          <img
            src={image}
            alt="Recipe preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full hover:bg-gray-100"
                title="Edit image"
              >
                <PencilIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 bg-white rounded-full hover:bg-gray-100"
                title="Delete image"
              >
                <TrashIcon className="h-5 w-5 text-red-600" />
              </button>
              {isUploading && <UploadProgress progress={uploadProgress} />}
            </div>
          </div>
        </div>
      ) : (
        // Upload button when no image
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-center">
            {isUploading ? (
              <UploadProgress progress={uploadProgress} />
            ) : (
              <>
                <PlusIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <span className="mt-2 block text-sm font-medium text-gray-600">
                  Drop an image here, or click to upload
                </span>
              </>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

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
    authorId: '', // You'll need to get this from your auth context
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

  const removeIngredient = (index: number): void => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    
    const items = Array.from(recipe.ingredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setRecipe({ ...recipe, ingredients: items });
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

          {/* Image Upload */}
          <ImageUpload
            image={recipe.image}
            onImageChange={(url) => setRecipe({ ...recipe, image: url })}
            className="mt-6"
          />

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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="ingredients">
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
};

export default RecipeEditor; 