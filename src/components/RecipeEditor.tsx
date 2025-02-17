import React, { FC, useEffect, useState, useCallback, useRef } from 'react';
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
import { formatBytes, formatDuration } from '../utils/formatters';
import { deleteVideo } from '../services/videoService';
import { VideoMetadata } from '../types/shared';

// ... rest of the file stays the same ... 

interface VideoUploadProps {
  video: string | null;
  onVideoChange: (video: string | null) => void;
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
    if (!video) return;

    try {
      const videoRef = ref(storage, video);
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

      {video ? (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden">
            <video
              src={video}
              controls
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="flex items-center justify-end space-x-2">
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
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
            isUploading
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

// ... rest of the file ... 