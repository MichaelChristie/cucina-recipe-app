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
import { Recipe, RecipeIngredient, IngredientDivider, isIngredientDivider, Difficulty } from '../types/recipe';
import { TagCategory, TAG_CATEGORIES } from '../types/admin';
import { addTag } from '../services/tagService';

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

      const [ingredients, allTags] = await Promise.all([
        getIngredients(),
        getTags()
      ]);

      const tagsByCategory = allTags.reduce((acc, tag) => {
        if (tag.category && Object.keys(TAG_CATEGORIES).includes(tag.category)) {
          if (!acc[tag.category]) {
            acc[tag.category] = [];
          }
          acc[tag.category].push(tag);
        }
        return acc;
      }, {} as Record<TagCategory, Tag[]>);

      const requiredCategories: TagCategory[] = [
        'cuisine',
        'dietary',
        'meal type',
        'style',
        'season'
      ];

      const recipes = await getRecipes();

      for (const recipe of recipes) {
        const selectedIngredients = recipe.ingredients?.length ? recipe.ingredients : ingredients
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 5) + 4)
          .map(ingredient => ({
            id: ingredient.id,
            ingredientId: ingredient.id,
            name: ingredient.name,
            amount: Number((ingredient.defaultAmount * (0.5 + Math.random())).toFixed(2)),
            unit: ingredient.defaultUnit,
            confirmed: false
          } as RecipeIngredient));

        const steps = recipe.steps?.length ? recipe.steps : Array.from(
          { length: Math.floor(Math.random() * 5) + 4 },
          (_, index) => ({
            order: index + 1,
            instruction: getRandomInstruction()
          })
        );

        const existingTags = recipe.tags || [];
        const existingTagObjects = existingTags
          .map(tagId => allTags.find(t => t.id === tagId))
          .filter((tag): tag is Tag => tag !== undefined);

        const existingCategories = new Set(
          existingTagObjects
            .map(tag => tag.category)
            .filter((cat): cat is TagCategory => 
              cat !== undefined && TAG_CATEGORIES.includes(cat)
            )
        );

        const newTags = requiredCategories
          .filter(category => !existingCategories.has(category))
          .map(category => {
            const categoryTags = tagsByCategory[category];
            if (categoryTags && categoryTags.length > 0) {
              return categoryTags[Math.floor(Math.random() * categoryTags.length)];
            }
            return null;
          })
          .filter((tag): tag is Tag => tag !== null);

        const updatedTags = [
          ...existingTags,
          ...newTags.map(tag => tag.id)
        ];

        const difficulty = recipe.difficulty || getRandomDifficulty();
        
        const updatedRecipe: Partial<Recipe> = {
          ...recipe,
          ingredients: selectedIngredients,
          steps,
          tags: updatedTags,
          cookTime: recipe.cookTime || String(Math.floor(Math.random() * 106) + 15),
          prepTime: recipe.prepTime || String(Math.floor(Math.random() * 41) + 5),
          difficulty: difficulty as Difficulty,
          servings: recipe.servings || Math.floor(Math.random() * 7) + 2
        };

        await updateRecipe(recipe.id!, updatedRecipe);
      }

      setStatus('Dummy data generated successfully! Recipes have been updated with ingredients, steps, and missing category tags.');
    } catch (error) {
      setStatus(`Error generating dummy data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoTagRecipes = async () => {
    try {
      setTagManagement(prev => ({ ...prev, isProcessing: true, status: 'Starting...' }));
      
      const [allTags, recipes] = await Promise.all([
        getTags(),
        getRecipes()
      ]);
      
      setTagManagement(prev => ({ 
        ...prev, 
        totalCount: recipes.length,
        status: 'Processing recipes...' 
      }));

      for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const newTagIds = new Set<string>();

        // Auto-tag based on title and description
        allTags.forEach(tag => {
          const searchText = `${recipe.title} ${recipe.description || ''}`.toLowerCase();
          if (searchText.includes(tag.name.toLowerCase())) {
            newTagIds.add(tag.id);
          }
        });

        // Auto-tag based on ingredients
        if (recipe.ingredients) {
          recipe.ingredients.forEach(ingredient => {
            if (!isIngredientDivider(ingredient)) {
              allTags.forEach(tag => {
                if (ingredient.name.toLowerCase().includes(tag.name.toLowerCase())) {
                  newTagIds.add(tag.id);
                }
              });
            }
          });
        }

        // Update recipe if new tags were found
        if (newTagIds.size > 0) {
          const existingTagIds = new Set(recipe.tags || []);
          const uniqueTagIds = [...new Set([...existingTagIds, ...newTagIds])];
          
          const updatedRecipe: Partial<Recipe> = {
            ...recipe,
            tags: uniqueTagIds
          };
          
          await updateRecipe(recipe.id!, updatedRecipe);
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
        status: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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

  const getRandomDifficulty = (): Difficulty => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  };

  const handleTagUpdate = (tag: Tag): string => {
    return tag.id;
  };

  const getTagIds = (tags: (Tag | string)[]): string[] => {
    return tags.map(tag => typeof tag === 'string' ? tag : tag.id);
  };

  const processIngredients = (ingredients: Array<RecipeIngredient | IngredientDivider>): Array<RecipeIngredient | IngredientDivider> => {
    return ingredients.map(ingredient => {
      if (isIngredientDivider(ingredient)) {
        return ingredient;
      }
      return {
        id: ingredient.id,
        ingredientId: ingredient.ingredientId,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        defaultUnit: ingredient.defaultUnit,
        confirmed: ingredient.confirmed || false
      } as RecipeIngredient;
    });
  };

  const handleRecipeUpdate = async (recipeToUpdate: Recipe) => {
    const uniqueTags = Array.from(new Set(recipeToUpdate.tags));

    const updatedRecipe: Partial<Recipe> = {
      ...recipeToUpdate,
      ingredients: processIngredients(recipeToUpdate.ingredients),
      difficulty: recipeToUpdate.difficulty as Difficulty,
      tags: uniqueTags
    };

    await updateRecipe(recipeToUpdate.id!, updatedRecipe);
  };

  const handleTagSuggestions = async (recipe: Recipe) => {
    const existingCategories = new Set<TagCategory>(
      tags
        .filter(tag => recipe.tags.includes(tag.id))
        .map(tag => tag.category)
        .filter((category): category is TagCategory => 
          category !== undefined && Object.keys(TAG_CATEGORIES).includes(category)
        )
    );

    const missingCategories = (Object.keys(TAG_CATEGORIES) as TagCategory[])
      .filter(category => !existingCategories.has(category));

    // Rest of the function implementation...
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
                      Backup Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map(backup => (
                    <tr key={backup.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(backup.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleBackupSelect(backup.id)}
                          className={`mr-2 px-3 py-1 rounded ${
                            selectedBackup === backup.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Restore Confirmation */}
          {selectedBackup && (
            <div className="mt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Restore from Selected Backup?
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  This will replace all current data with the data from the selected backup.
                  This action cannot be undone.
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setConfirmRestore(true)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 
                             transition-colors disabled:bg-gray-400"
                    disabled={isLoading}
                  >
                    Confirm Restore
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBackup('');
                      setConfirmRestore(false);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Final Restore Confirmation */}
          {confirmRestore && (
            <div className="mt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  This action will permanently replace all current data.
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRestoreBackup}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 
                             transition-colors disabled:bg-gray-400"
                    disabled={isLoading}
                  >
                    Yes, Restore Now
                  </button>
                  <button
                    onClick={() => setConfirmRestore(false)}
                    className="text-gray-600 hover:text-gray-800"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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