import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getRecipeById, updateRecipe, addRecipe, deleteRecipe } from '../services/recipeService';
import AdminLayout from './AdminLayout';
import { 
  ChevronLeftIcon, TagIcon, 
  Bars3Icon, PlusIcon, TrashIcon, CheckIcon, 
  ChevronRightIcon, PencilIcon, PlusCircleIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
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
import { getTags } from '../services/tagService';
import { getIngredients, addIngredient as addIngredientToDb } from '../services/ingredientService';
import { EditorRecipe, EditorIngredient, StickyFooterProps, AddIngredientModalProps, IngredientDivider } from '../types/editor';
import { Tag, Ingredient } from '../types/admin';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import { getFFmpeg, loadFFmpeg, writeFileToFFmpeg, readFileFromFFmpeg } from '../utils/ffmpeg';
import { formatBytes, formatDuration } from '../utils/formatters';
import { deleteVideo } from '../services/videoService';
import { VideoMetadata } from '../types/shared';

// ... rest of the file stays the same ... 