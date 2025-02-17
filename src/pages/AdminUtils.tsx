import React, { useState, useEffect } from 'react';
import { restoreRecipeData } from '../services/recipeService';
import { backupService } from '../services/backupService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import AdminLayout from '../components/AdminLayout';
import { getTags } from '../services/tagService';
import { getRecipes, updateRecipe } from '../services/recipeService';
import { getIngredients } from '../services/ingredientService';
import { Tag, Ingredient } from '../types/admin';
import { Recipe, RecipeIngredient, IngredientDivider, isIngredientDivider, Difficulty } from './types/recipe';
import { TagCategory, TAG_CATEGORIES } from './types/admin';

interface Backup {
  id: string;
  timestamp: string;
  recipes: Record<string, any>;
}

interface TagManagementState {
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
  status: string;
}

interface AdminUtilsProps {
  // Add your props here
}

const AdminUtils: React.FC<AdminUtilsProps> = () => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [tagManagement, setTagManagement] = useState<TagManagementState>({
    isProcessing: false,
    processedCount: 0,
    totalCount: 0,
    status: ''
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackups();
    loadData();
  }, []);

  const fetchBackups = async () => {
    try {
      const backupsSnapshot = await getDocs(collection(db, 'backups'));
      const backupsData = backupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Backup[];
      
      // Sort backups by timestamp, most recent first
      backupsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setBackups(backupsData);
    } catch (error) {
      console.error('Error fetching backups:', error);
      setStatus('Error fetching backups');
    }
  };

  const loadData = async () => {
    try {
      const [loadedIngredients, loadedTags, loadedRecipes] = await Promise.all([
        getIngredients(),
        getTags(),
        getRecipes()
      ]);
      setIngredients(loadedIngredients);
      setTags(loadedTags);
      setRecipes(loadedRecipes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setStatus('Creating backup...');
      const backup = await backupService.createBackup();
      await fetchBackups(); // Refresh the backups list
      setStatus('Backup created successfully!');
    } catch (error) {
      setStatus(`Error creating backup: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupSelect = (backupId: string) => {
    setSelectedBackup(backupId);
    setConfirmRestore(false); // Reset confirmation when selecting new backup
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) {
      setStatus('Please select a backup to restore');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Restoring from backup...');
      await backupService.restoreFromBackup(selectedBackup);
      setStatus('Backup restored successfully!');
      setConfirmRestore(false);
      setSelectedBackup('');
    } catch (error) {
      setStatus(`Error restoring backup: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleGenerateDummyData = async () => {
    try {
      setIsLoading(true);
      setStatus('Generating dummy data...');

      // First, fetch all available ingredients and tags
      const [ingredients, tags] = await Promise.all([
        getIngredients(),
        getTags()
      ]);

      // Group tags by category
      const tagsByCategory = tags.reduce((acc, tag) => {
        const category = tag.category || 'other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tag);
        return acc;
      }, {} as Record<string, Tag[]>);

      // Define the required categories
      const requiredCategories = [
        'cuisine',    // e.g., Italian, Mexican, Indian
        'diet',       // e.g., Vegetarian, Vegan, Gluten-Free
        'meal',       // e.g., Breakfast, Lunch, Dinner
        'style',      // e.g., Grilled, Baked, Fried
        'special'     // e.g., Holiday, Seasonal, Party
      ];

      // Get all recipes
      const recipes = await getRecipes();

      // Update each recipe
      for (const recipe of recipes) {
        // Generate random ingredients if missing
        const selectedIngredients = recipe.ingredients?.length ? recipe.ingredients : ingredients
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 5) + 4) // 4-8 ingredients
          .map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            amount: Number((ingredient.defaultAmount * (0.5 + Math.random())).toFixed(2)),
            unit: ingredient.defaultUnit
          }));

        // Generate random steps if missing
        const steps = recipe.steps?.length ? recipe.steps : Array.from({ length: Math.floor(Math.random() * 5) + 4 }, // 4-8 steps
          (_, index) => ({
            order: index + 1,
            instruction: getRandomInstruction()
          }));

        // Get existing recipe tags
        const existingTags = recipe.tags || [];
        const existingTagObjects = existingTags.map(tagId => 
          tags.find(t => t.id === tagId)
        ).filter((tag): tag is Tag => tag !== null);

        // Get categories that already have tags
        const existingCategories = new Set(
          existingTagObjects.map(tag => tag.category)
        );

        // Select one random tag from each missing category
        const newTags = requiredCategories
          .filter(category => !existingCategories.has(category)) // Only process categories that don't have tags
          .map(category => {
            const categoryTags = tagsByCategory[category];
            if (categoryTags && categoryTags.length > 0) {
              return categoryTags[Math.floor(Math.random() * categoryTags.length)];
            }
            return null;
          })
          .filter((tag): tag is Tag => tag !== null);

        // Combine existing and new tags
        const updatedTags = [
          ...existingTags.map(tag => {
            // If it's already a tag object, extract just the ID
            if (typeof tag === 'object' && tag !== null && 'id' in tag) {
              return String(tag.id);
            }
            return String(tag); // If it's already an ID string
          }),
          ...newTags.map(tag => String(tag.id))
        ];

        // Generate recipe details if missing
        const updatedRecipe = {
          ...recipe,
          ingredients: selectedIngredients,
          steps,
          tags: updatedTags, // Now we're sure these are all ID strings
          cookTime: recipe.cookTime || String(Math.floor(Math.random() * 106) + 15),
          prepTime: recipe.prepTime || String(Math.floor(Math.random() * 41) + 5),
          difficulty: recipe.difficulty || getRandomDifficulty(),
          servings: recipe.servings || Math.floor(Math.random() * 7) + 2
        };

        // Update the recipe
        await updateRecipe(recipe.id!, updatedRecipe);
      }

      setStatus('Dummy data generated successfully! Recipes have been updated with ingredients, steps, and missing category tags.');
    } catch (error) {
      setStatus(`Error generating dummy data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoTagRecipes = async () => {
    try {
      setTagManagement(prev => ({ ...prev, isProcessing: true, status: 'Starting...' }));
      
      // Get all tags and recipes
      const tags = await getTags();
      const recipes = await getRecipes();
      
      setTagManagement(prev => ({ 
        ...prev, 
        totalCount: recipes.length,
        status: 'Processing recipes...' 
      }));

      // Process each recipe
      for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const newTags: Tag[] = [];

        // Auto-tag based on title and description
        tags.forEach(tag => {
          const searchText = `${recipe.title} ${recipe.description || ''}`.toLowerCase();
          if (searchText.includes(tag.name.toLowerCase())) {
            newTags.push(tag);
          }
        });

        // Auto-tag based on ingredients
        recipe.ingredients?.forEach(ingredient => {
          tags.forEach(tag => {
            if (ingredient.name.toLowerCase().includes(tag.name.toLowerCase())) {
              if (!newTags.find(t => t.id === tag.id)) {
                newTags.push(tag);
              }
            }
          });
        });

        // Update recipe if new tags were found
        if (newTags.length > 0) {
          const existingTags = recipe.tags || [];
          const uniqueTags = [...existingTags, ...newTags]
            .filter((tag, index, self) => 
              index === self.findIndex(t => t.id === tag.id)
            );
          
          await updateRecipe(recipe.id!, { ...recipe, tags: uniqueTags });
        }

        setTagManagement(prev => ({ 
          ...prev, 
          processedCount: i + 1,
          status: `Processed ${i + 1} of ${recipes.length} recipes...`
        }));
      }

      setTagManagement(prev => ({ 
        ...prev, 
        isProcessing: false,
        status: `Completed! Tagged ${recipes.length} recipes.`
      }));

    } catch (error) {
      setTagManagement(prev => ({ 
        ...prev, 
        isProcessing: false,
        status: `Error: ${error.message}`
      }));
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const getRandomInstruction = (): string => {
    const loremPhrases = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco. Duis aute irure dolor in reprehenderit in voluptate velit.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa. Qui officia deserunt mollit anim id est laborum.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem. Accusantium doloremque laudantium, totam rem aperiam.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit. Aut fugit, sed quia consequuntur magni dolores.",
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet. Consectetur, adipisci velit, sed quia non numquam.",
      "Eius modi tempora incidunt ut labore et dolore magnam aliquam. Quaerat voluptatem sequi nesciunt, neque porro.",
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit. Esse quam nihil molestiae consequatur, vel illum.",
    ];
    
    // Get two random different phrases and combine them
    const firstPhrase = loremPhrases[Math.floor(Math.random() * loremPhrases.length)];
    let secondPhrase;
    do {
      secondPhrase = loremPhrases[Math.floor(Math.random() * loremPhrases.length)];
    } while (secondPhrase === firstPhrase);
    
    return `${firstPhrase} ${secondPhrase}`;
  };

  const getRandomDifficulty = (): string => {
    const difficulties = ['easy', 'medium', 'hard'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  };

  const handleTagUpdate = (tag: Tag | null): string => {
    if (tag && typeof tag === 'object' && 'id' in tag) {
      return String(tag.id);
    }
    return '';
  };

  const getTagIds = (tags: (Tag | string)[]): string[] => {
    return tags.map(tag => {
      if (typeof tag === 'string') return tag;
      return tag.id;
    });
  };

  const handleRecipeUpdate = async (recipe: Recipe, updatedRecipe: Partial<Recipe>) => {
    try {
      // Convert ingredients to proper type
      const typedIngredients = updatedRecipe.ingredients?.map(ingredient => ({
        ingredientId: ingredient.id || ingredient.ingredientId,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        defaultUnit: ingredient.defaultUnit,
        confirmed: ingredient.confirmed || false
      }));

      // Convert tags to string array
      const typedTags = updatedRecipe.tags ? getTagIds(updatedRecipe.tags) : [];

      const validRecipeUpdate: Partial<Recipe> = {
        ...updatedRecipe,
        ingredients: typedIngredients,
        tags: typedTags
      };

      await updateRecipe(recipe.id, validRecipeUpdate);
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const findMatchingTags = (ingredient: RecipeIngredient, allTags: Tag[]): Tag[] => {
    return allTags.filter(tag => {
      if (!ingredient.name) return false;
      return ingredient.name.toLowerCase().includes(tag.name.toLowerCase());
    });
  };

  const getUniqueTags = (tags: Tag[]): string[] => {
    return Array.from(new Set(tags.map(tag => tag.id)));
  };

  const updateRecipeDifficulty = async (recipe: Recipe, newDifficulty: Difficulty) => {
    try {
      const updatedRecipe: Partial<Recipe> = {
        ...recipe,
        difficulty: newDifficulty
      };
      await updateRecipe(recipe.id, updatedRecipe);
      return true;
    } catch (error) {
      console.error('Error updating recipe difficulty:', error);
      return false;
    }
  };

  const processNewTags = async (existingCategories: Set<TagCategory>) => {
    try {
      const newTags: Omit<Tag, 'id'>[] = TAG_CATEGORIES
        .filter(category => !existingCategories.has(category))
        .map(category => ({
          name: category,
          emoji: '🏷️',
          category: category,
          active: true
        }));

      for (const tagData of newTags) {
        await addTag(tagData);
      }

      return true;
    } catch (error) {
      console.error('Error processing new tags:', error);
      return false;
    }
  };

  const addTagsToRecipe = async (recipe: Recipe, tags: Tag[]) => {
    try {
      const uniqueTags = tags
        .filter((tag, index, self) => 
          index === self.findIndex(t => t.id === tag.id)
        )
        .map(tag => tag.id);

      const updatedRecipe: Partial<Recipe> = {
        ...recipe,
        tags: uniqueTags
      };

      await updateRecipe(recipe.id, updatedRecipe);
      return true;
    } catch (error) {
      console.error('Error adding tags to recipe:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Utilities</h1>
        
        <div className="space-y-6">
          {/* Data Generation */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Data Generation</h2>
            <button
              onClick={handleGenerateDummyData}
              disabled={isLoading}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-400 
                       hover:bg-purple-600 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Dummy Data'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              This will add random ingredients and steps to recipes that are missing them.
            </p>
          </div>

          {/* Tag Management */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Tag Management</h2>
            <button
              onClick={handleAutoTagRecipes}
              disabled={tagManagement.isProcessing}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400 
                       hover:bg-green-600 transition-colors"
            >
              {tagManagement.isProcessing ? 'Processing...' : 'Auto-Tag Recipes'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Automatically add relevant tags to recipes based on their titles, descriptions, and ingredients.
            </p>
            {tagManagement.isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(tagManagement.processedCount / tagManagement.totalCount) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{tagManagement.status}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Backup Creation */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Backup Management</h2>
            <div className="flex gap-4">
              <button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 
                         hover:bg-blue-600 transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create New Backup'}
              </button>
            </div>
          </div>

          {/* Backup List with Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Backups</h2>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr 
                      key={backup.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedBackup === backup.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleBackupSelect(backup.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="radio"
                          name="backup-selection"
                          checked={selectedBackup === backup.id}
                          onChange={() => handleBackupSelect(backup.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(backup.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Object.keys(backup.recipes || {}).length} recipes
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Restore Controls */}
            {selectedBackup && (
              <div className="mt-4 space-y-4">
                {!confirmRestore ? (
                  <button
                    onClick={() => setConfirmRestore(true)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded
                             hover:bg-yellow-600 transition-colors"
                  >
                    Review Selected Backup
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <p className="text-yellow-800">
                        Are you sure you want to restore this backup? This will overwrite current data.
                      </p>
                      <p className="text-sm text-yellow-600 mt-2">
                        Selected backup: {formatDate(backups.find(b => b.id === selectedBackup)?.timestamp || '')}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleRestoreBackup}
                        disabled={isLoading}
                        className="bg-green-500 text-white px-4 py-2 rounded
                                 hover:bg-green-600 transition-colors disabled:bg-gray-400"
                      >
                        {isLoading ? 'Restoring...' : 'Confirm Restore'}
                      </button>
                      <button
                        onClick={() => setConfirmRestore(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded
                                 hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Messages */}
          {status && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              {status}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUtils; 