import * as React from 'react';
import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getRecipeById, updateRecipe, addRecipe, deleteRecipe } from '../../services/recipeService.ts';
import AdminLayout from '../../components/AdminLayout';
import { 
  ChevronLeftIcon, TagIcon, 
  Bars3Icon, PlusIcon, TrashIcon, CheckIcon, 
  ChevronRightIcon, PencilIcon, PlusCircleIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import { toast, ToastOptions } from 'react-hot-toast';
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
import { getTags } from '../../services/tagService.ts';
import { getIngredients, addIngredient as addIngredientToDb } from '../../services/ingredientService.ts';
import { EditorRecipe, EditorIngredient, StickyFooterProps, AddIngredientModalProps } from '../../types/editor';
import { Tag, Ingredient } from '../../types/admin';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { getAuth } from 'firebase/auth';
import { Recipe, Step, RecipeIngredient, IngredientDivider, isIngredientDivider } from '../../types/recipe';
import { formatBytes } from '../../utils/formatters';
import { deleteVideo } from '../../services/videoService';

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

const DIFFICULTY_LEVELS = [
  'easy',
  'medium',
  'hard',
  'expert'
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

interface LocalStickyFooterProps {
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
  saving: boolean;
  recipeId?: string;
}

const StickyFooter: FC<LocalStickyFooterProps> = ({ onSave, onClose, onDelete, saving, recipeId }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Delete button - only show if we have a recipeId */}
          {recipeId && (
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Are you sure?</span>
                  <button
                    type="button"
                    onClick={() => onDelete?.()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200"
                >
                  Delete Recipe
                </button>
              )}
            </div>
          )}

          {/* Existing buttons */}
          <div className="flex items-center space-x-4">
            {recipeId && (
              <button
                type="button"
                onClick={() => window.open(`/recipe/${recipeId}`, '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                Preview
              </button>
            )}
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
  const progressValue = isNaN(progress) ? 0 : Math.min(Math.max(progress, 0), 100);
  const offset = circumference - (progressValue / 100) * circumference;

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
          strokeDasharray={circumference.toString()}
          strokeDashoffset={offset.toString()}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
      </svg>
      <span className="absolute text-xs">{Math.round(progressValue)}%</span>
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
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {image ? (
        // Image preview container with buttons underneath
        <div className="space-y-2">
          <div className="h-48 rounded-lg overflow-hidden">
            <img
              src={image}
              alt="Recipe preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white rounded-full hover:bg-gray-100 border border-gray-200"
              title="Edit image"
            >
              <PencilIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 bg-white rounded-full hover:bg-gray-100 border border-gray-200"
              title="Delete image"
            >
              <TrashIcon className="h-5 w-5 text-red-600" />
            </button>
            {isUploading && <UploadProgress progress={uploadProgress} />}
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

interface VideoMetadata {
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  size?: number;
  format?: string;
}

interface VideoUploadProps {
  video: VideoMetadata | null;
  onVideoChange: (video: VideoMetadata | null) => void;
  className?: string;
}

const VideoUpload: FC<VideoUploadProps> = ({ video, onVideoChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file is too large. Maximum size is 100MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const filename = `recipe-videos/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload the video
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload video');
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onVideoChange(downloadURL);
            toast.success('Video uploaded successfully');
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to process uploaded video');
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error in handleVideoUpload:', error);
      toast.error('Failed to upload video');
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!video?.url) return;

    try {
      const videoRef = ref(storage, video.url);
      await deleteObject(videoRef);
      onVideoChange(null);
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      if (error.code === 'storage/object-not-found') {
        // If the video is already gone, just update the UI
        onVideoChange(null);
        toast.success('Video removed');
      } else {
        toast.error('Failed to delete video');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            handleVideoUpload(files[0]);
          }
        }}
        accept="video/*"
        className="hidden"
      />

      {video?.url ? (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden">
            <video
              src={video.url}
              controls
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="flex items-center justify-between">
            {video.size && (
              <span className="text-sm text-gray-600">
                {formatBytes(video.size)}
              </span>
            )}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full hover:bg-gray-100 border border-gray-200"
                title="Replace video"
              >
                <PencilIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 bg-white rounded-full hover:bg-gray-100 border border-gray-200"
                title="Delete video"
              >
                <TrashIcon className="h-5 w-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          disabled={isUploading}
        >
          <div className="text-center">
            {isUploading ? (
              <UploadProgress progress={uploadProgress} />
            ) : (
              <>
                <PlusIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <span className="mt-2 block text-sm font-medium text-gray-600">
                  Drop a video here, or click to upload
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  MP4, MOV up to 100MB
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
    steps: [{ order: 1, instruction: '' }],
    tags: [],
    showTagsPanel: false,
    authorId: '', // You'll need to get this from your auth context
    createdAt: new Date(),
    updatedAt: new Date(),
    video: null,
    featured: false,
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
          
          // Map ingredients with IDs
          const ingredientsWithIds = data.ingredients?.map(ing => ({
            ...ing,
            id: ing.id || generateId()
          })) || [];

          // Map steps to editor format
          const formattedSteps = data.steps?.map((step, index) => {
            // Handle different step data structures
            if (typeof step === 'object' && step !== null) {
              return {
                order: step.order || index + 1,
                instruction: step.instruction || ''
              };
            }
            return {
              order: index + 1,
              instruction: typeof step === 'string' ? step : ''
            };
          }) || [{ order: 1, instruction: '' }];

          console.log('Loaded steps:', formattedSteps);

          setRecipe({
            ...data,
            ingredients: ingredientsWithIds,
            steps: formattedSteps,
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
      console.log('Loading tags in RecipeEditor...');
      const fetchedTags = await getTags();
      console.log('Fetched tags:', fetchedTags);
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

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      if (!recipe.title.trim()) {
        toast.error('Title is required');
        return;
      }

      const hasInvalidIngredients = recipe.ingredients?.some(
        item => !('type' in item) && !item.ingredientId
      );
      
      if (hasInvalidIngredients) {
        toast.error('All ingredients must be selected from the suggestion list');
        return;
      }

      // Format steps to ensure they have the correct properties
      const formattedSteps = recipe.steps.map((step, index) => ({
        order: index + 1,
        instruction: step.instruction || '',
      }));

      const cleanRecipe = {
        ...recipe,
        tags: recipe.tags || [],
        nutrition: recipe.nutrition || { calories: '' },
        ingredients: recipe.ingredients?.map(item => {
          if ('type' in item && item.type === 'divider') {
            return item;
          }
          return {
            ingredientId: item.ingredientId,
            name: item.name,
            amount: item.amount,
            unit: item.unit
          };
        }) || [],
        steps: formattedSteps
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

  const handleSave = async () => {
    setSaving(true);
    await handleSubmit();
    setSaving(false);
  };

  const handleSaveAndClose = async (e: React.MouseEvent) => {
    setSaving(true);
    try {
      await handleSubmit(e as unknown as React.FormEvent);
      navigate('/admin/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setSaving(false);
    }
  };

  const onClose = () => {
    navigate('/admin/recipes');
  };

  const handleStepChange = (index: number, field: string, value: string) => {
    console.log('Step change:', { index, field, value }); // Debug log
    
    const updatedSteps = [...(recipe.steps || [])];
    if (!updatedSteps[index]) {
      updatedSteps[index] = { order: index + 1, instruction: '' };
    }
    
    // Create a new step object without spreading the old one to avoid any potential issues
    updatedSteps[index] = {
      order: index + 1,
      instruction: value
    };
    
    console.log('Updated step:', updatedSteps[index]); // Debug log
    setRecipe(prevRecipe => {
      const newRecipe = {
        ...prevRecipe,
        steps: updatedSteps.map((step, i) => ({
          order: i + 1,
          instruction: step.instruction || ''
        }))
      };
      console.log('New recipe state:', newRecipe); // Debug log
      return newRecipe;
    });
  };

  const addStep = () => {
    console.log('Adding new step'); // Debug log
    setRecipe(prevRecipe => {
      const newSteps = [...(prevRecipe.steps || [])];
      const newStep = {
        order: newSteps.length + 1,
        instruction: ''
      };
      newSteps.push(newStep);
      console.log('New step added:', newStep); // Debug log
      console.log('Updated recipe with new step:', { ...prevRecipe, steps: newSteps }); // Debug log
      return { ...prevRecipe, steps: newSteps };
    });
  };

  const removeStep = (index: number) => {
    setRecipe(prevRecipe => {
      const newSteps = prevRecipe.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({
          order: i + 1,
          instruction: step.instruction || ''
        }));
      return { ...prevRecipe, steps: newSteps };
    });
  };

  const handleIngredientChange = (index: number, field: keyof EditorIngredient, value: string | number | boolean): void => {
    const newIngredients = [...recipe.ingredients];
    const ingredient = newIngredients[index];
    
    if (!isIngredientDivider(ingredient)) {
      if (field === 'name') {
        newIngredients[index] = {
          ...ingredient,
          name: value as string,
          ingredientId: ''
        };
      } else {
        newIngredients[index] = {
          ...ingredient,
          [field]: field === 'amount' ? (value === '' ? '' : parseFloat(value as string) || 0) : value,
          ingredientId: ingredient.ingredientId || ingredient.id
        };
      }
      setRecipe({ ...recipe, ingredients: newIngredients });
    }
  };

  const handleIngredientSelect = (index: number, selectedIngredient: Ingredient): void => {
    const newIngredients = [...recipe.ingredients];
    const ingredient = newIngredients[index];
    
    if (!isIngredientDivider(ingredient)) {
      newIngredients[index] = {
        ...ingredient,
        id: generateId(),
        name: selectedIngredient.name,
        ingredientId: selectedIngredient.id,
        unit: selectedIngredient.defaultUnit || '',
        amount: selectedIngredient.defaultAmount ? Number(selectedIngredient.defaultAmount) : '',
        confirmed: false
      };
      setRecipe({ ...recipe, ingredients: newIngredients });
      setActiveIngredient({ index: null, field: null });
    }
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
      const element = document.querySelector(`#ingredient-${newIndex}`) as HTMLInputElement;
      element?.focus();
    }, 0);
  };

  const removeIngredient = (index: number) => {
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
    const ingredient = recipe.ingredients[index];
    
    if (!ingredient) return;
    
    if (!isIngredientDivider(ingredient)) {
      const showCreateOption = !hasFilteredIngredients && ingredient.name;
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
              const amountElement = document.querySelector(`#amount-${index}`) as HTMLInputElement | null;
              amountElement?.focus();
            } else if (showCreateOption && selectedSuggestionIndex === 0) {
              setNewIngredientName(ingredient.name || '');
              setActiveIngredientIndex(index);
              setIsIngredientModalOpen(true);
            }
          } else if (activeIngredient.field === 'amount') {
            const amount = ingredient.amount;
            if (amount && amount > 0) {
              if (index === recipe.ingredients.length - 1) {
                addIngredient();
              }
              setTimeout(() => {
                const nextElement = document.querySelector(`#ingredient-${index + 1}`) as HTMLInputElement | null;
                nextElement?.focus();
              }, 0);
            }
          }
          break;
        case 'Escape':
          setActiveIngredient({ index: null, field: null });
          setSelectedSuggestionIndex(0);
          break;
      }
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
      
      if (!addedIngredient || !addedIngredient.id) {
        throw new Error('No response from addIngredient');
      }

      const completeIngredient: Ingredient = {
        ...addedIngredient,
        id: addedIngredient.id,
        name: newIngredientData.name,
        category: newIngredientData.category,
        defaultUnit: newIngredientData.defaultUnit,
        defaultAmount: Number(newIngredientData.defaultAmount),
        createdAt: now,
        updatedAt: now
      };

      setAvailableIngredients(prev => [...prev, completeIngredient]);
      
      if (activeIngredientIndex !== null) {
        const newIngredients = [...recipe.ingredients];
        const ingredient = newIngredients[activeIngredientIndex];
        
        if (!isIngredientDivider(ingredient)) {
          newIngredients[activeIngredientIndex] = {
            ...ingredient,
            id: generateId(),
            name: completeIngredient.name,
            ingredientId: completeIngredient.id,
            unit: completeIngredient.defaultUnit || '',
            amount: completeIngredient.defaultAmount ? Number(completeIngredient.defaultAmount) : '',
            confirmed: false
          };
          setRecipe({ ...recipe, ingredients: newIngredients });
        }
      }

      return completeIngredient;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      toast.error('Failed to create ingredient');
      throw error;
    }
  };

  const addDivider = () => {
    const newDivider = {
      id: generateId(),
      type: 'divider' as const,
      label: 'New Section'
    };
    
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newDivider]
    }));
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await deleteRecipe(id);
      toast.success('Recipe deleted successfully');
      navigate('/admin/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
    }
  };

  const handleVideoDelete = async () => {
    if (!recipe.video) return;
    
    try {
      setLoading(true);
      await deleteVideo(recipe.video);
      setRecipe(prev => ({ ...prev, video: null }));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      if (error.code === 'storage/object-not-found') {
        // If the video is already gone, just update the UI
        setRecipe(prev => ({ ...prev, video: null }));
        toast.success('Video removed');
      } else {
        toast.error('Failed to delete video');
      }
    } finally {
      setLoading(false);
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

          {/* Title */}
          <div className="group relative mb-40">
            <input
              type="text"
              value={recipe.title || 'Untitled Recipe'}
              onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
              className="mt-1 block w-full text-4xl font-bold text-gray-900 border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 px-0 py-2 focus:ring-0 bg-transparent placeholder-gray-400 transition-colors duration-200"
              required
              placeholder="Enter recipe title..."
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <PencilIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="absolute -bottom-6 left-0 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Click to edit title
            </div>
          </div>

          {/* Add the short description textarea here */}
          <div className="group relative mb-12">
            <textarea
              value={recipe.description || ''}
              onChange={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                setRecipe({ ...recipe, description: e.target.value });
              }}
              className="mt-1 block w-full text-lg text-gray-700 border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 px-0 py-2 focus:ring-0 bg-transparent placeholder-gray-400 transition-colors duration-200 resize-none overflow-hidden min-h-[3rem]"
              placeholder="Add a short description of your recipe..."
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <PencilIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="absolute -bottom-6 left-0 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Brief description that appears in recipe cards and search results
            </div>
            <div className="absolute bottom-[-2rem] left-0 right-0 border-b border-gray-200" />
          </div>

          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-4">&nbsp;</h2>
          </div>

          {/* Featured Toggle - now with more spacing */}
          <div className="mt-16 flex items-center gap-2">
            <Switch
              checked={recipe.featured || false}
              onChange={(checked) => setRecipe({ ...recipe, featured: checked })}
              className={`${
                recipe.featured ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Featured Recipe</span>
              <span
                className={`${
                  recipe.featured ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className="text-sm font-medium text-gray-700">Featured Recipe</span>
          </div>

          {/* Media Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Image</h2>
              <ImageUpload
                image={recipe.image}
                onImageChange={(url) => setRecipe({ ...recipe, image: url })}
              />
            </div>

            {/* Video Upload */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Video (Optional)</h2>
              <VideoUpload
                video={recipe.video}
                onVideoChange={(video) => setRecipe({ ...recipe, video })}
              />
            </div>
          </div>

          {/* Recipe Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Prep Time */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Prep Time</h2>
              <input
                type="text"
                value={recipe.prepTime || ''}
                onChange={(e) => setRecipe({ ...recipe, prepTime: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                placeholder="e.g. 15 minutes"
              />
            </div>

            {/* Cook Time */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cook Time</h2>
              <input
                type="text"
                value={recipe.cookTime || ''}
                onChange={(e) => setRecipe({ ...recipe, cookTime: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                placeholder="e.g. 45 minutes"
              />
            </div>

            {/* Difficulty */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Difficulty</h2>
              <select
                value={recipe.difficulty || 'easy'}
                onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Servings */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Servings</h2>
              <input
                type="number"
                value={recipe.servings || ''}
                onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) || '' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                placeholder="e.g. 4"
                min="1"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tags</h2>
            <div className="bg-white rounded-lg shadow-sm">
              <button
                type="button"
                onClick={() => {
                  console.log('Current recipe tags:', recipe.tags);
                  console.log('Available tags:', tags);
                  setRecipe(prev => ({ ...prev, showTagsPanel: !prev.showTagsPanel }));
                }}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags?.length > 0 ? (
                      tags
                        .filter(tag => {
                          console.log('Checking tag:', tag, 'Active:', tag.active, 'Included:', recipe.tags.includes(tag.id));
                          return tag.active && recipe.tags.includes(tag.id);
                        })
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
                      tags.filter(tag => tag.active).reduce((acc, tag) => {
                        if (!acc[tag.category]) acc[tag.category] = [];
                        acc[tag.category].push(tag);
                        return acc;
                      }, {} as Record<string, Tag[]>)
                    ).map(([category, categoryTags]) => (
                      <div key={category} className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">{category}</h3>
                        <div className="space-y-1">
                          {(categoryTags as Tag[]).map((tag) => (
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300 flex items-center gap-2 shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Ingredient
                </button>
                <button
                  type="button"
                  onClick={addDivider}
                  className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300 flex items-center gap-2 shadow-sm"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  Add Section Divider
                </button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="ingredients">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {recipe.ingredients?.map((item, index) => (
                      <Draggable 
                        key={item.id}
                        draggableId={item.id}
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
                            
                            {isIngredientDivider(item) ? (
                              // Render divider
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(e) => {
                                    const newIngredients = [...recipe.ingredients];
                                    (newIngredients[index] as IngredientDivider).label = e.target.value;
                                    setRecipe({ ...recipe, ingredients: newIngredients });
                                  }}
                                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-gray-50 font-medium"
                                  placeholder="Section name..."
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
                                    setRecipe({ ...recipe, ingredients: newIngredients });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              // Render ingredient
                              <>
                                <div className="flex-1 relative ingredient-field">
                                  <input
                                    id={`ingredient-${index}`}
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                    onFocus={() => {
                                      setActiveIngredient({ index, field: 'name' });
                                      setSelectedSuggestionIndex(0);
                                    }}
                                    onKeyDown={(e) => {
                                      const filteredIngredients = availableIngredients.filter(ing => 
                                        ing.name.toLowerCase().includes(item.name.toLowerCase())
                                      );
                                      handleIngredientKeyDown(e, index, filteredIngredients);
                                    }}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                                    placeholder="Start typing ingredient name..."
                                  />
                                  {activeIngredient.index === index && 
                                   activeIngredient.field === 'name' && 
                                   item.name && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                      {availableIngredients
                                        .filter(ing => 
                                          ing.name.toLowerCase().includes(item.name.toLowerCase())
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
                                              const amountElement = document.querySelector(`#amount-${index}`) as HTMLInputElement | null;
                                              amountElement?.focus();
                                            }}
                                            onMouseEnter={() => setSelectedSuggestionIndex(suggestionIndex)}
                                          >
                                            <span className="font-medium">{ing.name}</span>
                                            <span className="text-sm text-gray-500 ml-2">({ing.category})</span>
                                          </button>
                                        ))}
                                      {availableIngredients.filter(ing => 
                                        ing.name.toLowerCase().includes(item.name.toLowerCase())
                                      ).length === 0 && (
                                        <div>
                                          <div className="px-4 py-2 text-gray-500 italic">
                                            No ingredients found
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setNewIngredientName(item.name);
                                              setActiveIngredientIndex(index);
                                              setIsIngredientModalOpen(true);
                                            }}
                                            onMouseEnter={() => setSelectedSuggestionIndex(0)}
                                            className={`w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium border-t
                                              ${selectedSuggestionIndex === 0 ? 'bg-blue-50' : ''}`}
                                          >
                                            + Create "{item.name}"
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <input
                                  id={`amount-${index}`}
                                  type="number"
                                  value={item.amount || ''}
                                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                  onFocus={() => setActiveIngredient({ index, field: 'amount' })}
                                  onKeyDown={(e) => handleIngredientKeyDown(e, index, [])}
                                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 mx-2"
                                  placeholder="Amount"
                                  step="0.01"
                                />
                                <div className="relative ingredient-field w-32 mx-2">
                                  <select
                                    value={item.unit || ''}
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
                                  onClick={() => handleIngredientChange(index, 'confirmed', !item.confirmed)}
                                  className={`p-2 rounded-full ${item.confirmed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} hover:bg-opacity-80`}
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
                              </>
                            )}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-4">
              {recipe.steps?.map((step: Step, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 pt-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <MDXEditor
                      key={`step-${index}-${step.instruction}`}
                      markdown={step.instruction}
                      onChange={(content) => handleStepChange(index, 'instruction', content)}
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
                      contentEditableClassName="prose prose-sm max-w-none"
                      placeholder="Enter step instructions..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full flex-shrink-0"
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
        onClose={onClose}
        onDelete={handleDelete}
        saving={saving}
        recipeId={id}
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