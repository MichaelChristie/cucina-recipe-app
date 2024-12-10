import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getIngredients, updateIngredient, removeDuplicateIngredients, deleteIngredient, addIngredient } from '../../services/ingredientService';
import { PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Add available units constant
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

// Add categories constant
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

// Add Modal Component
function AddIngredientModal({ isOpen, onClose, onAdd }) {
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: AVAILABLE_CATEGORIES[0],
    defaultUnit: AVAILABLE_UNITS[0],
    defaultAmount: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAdd({
        ...newIngredient,
        defaultAmount: Number(newIngredient.defaultAmount),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      onClose();
    } catch (error) {
      console.error('Error adding ingredient:', error);
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                required
                value={newIngredient.category}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {AVAILABLE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Default Unit</label>
              <select
                required
                value={newIngredient.defaultUnit}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, defaultUnit: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {AVAILABLE_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await getIngredients();
      
      // Create a map to track duplicates, keeping the oldest entry
      const uniqueIngredients = data.reduce((acc, current) => {
        const existing = acc.get(current.name.toLowerCase());
        
        // Ensure timestamps exist
        const currentWithTimestamp = {
          ...current,
          createdAt: current.createdAt || new Date(),
          updatedAt: current.updatedAt || new Date()
        };
        
        if (!existing || (existing.createdAt > currentWithTimestamp.createdAt)) {
          acc.set(current.name.toLowerCase(), currentWithTimestamp);
        }
        
        return acc;
      }, new Map());

      // Convert map values back to array
      const dedupedIngredients = Array.from(uniqueIngredients.values());
      
      // Sort by name for consistent display
      const sortedIngredients = dedupedIngredients.sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setIngredients(sortedIngredients);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (ingredient) => {
    setEditingId(ingredient.id);
    setEditValues({
      name: ingredient.name,
      category: ingredient.category,
      defaultAmount: ingredient.defaultAmount,
      defaultUnit: ingredient.defaultUnit,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async (id) => {
    try {
      await updateIngredient(id, {
        ...editValues,
        defaultAmount: Number(editValues.defaultAmount),
        updatedAt: new Date()
      });
      
      setIngredients(ingredients.map(ing => 
        ing.id === id ? { ...ing, ...editValues } : ing
      ));
      
      setEditingId(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating ingredient:', error);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (window.confirm('This will remove duplicate ingredients. Are you sure?')) {
      try {
        await removeDuplicateIngredients();
        await loadIngredients(); // Reload the list
      } catch (error) {
        console.error('Error cleaning up duplicates:', error);
      }
    }
  };

  const handleDelete = async (ingredient) => {
    if (window.confirm(`Are you sure you want to delete "${ingredient.name}"? This cannot be undone.`)) {
      try {
        await deleteIngredient(ingredient.id);
        setIngredients(ingredients.filter(ing => ing.id !== ingredient.id));
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
  };

  const handleAddIngredient = async (newIngredient) => {
    try {
      const docRef = await addIngredient(newIngredient);
      const addedIngredient = {
        id: docRef.id,
        ...newIngredient
      };
      setIngredients([...ingredients, addedIngredient]);
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    try {
      // Handle both Date objects and Firestore Timestamps
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid date';
      
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getSortedIngredients = () => {
    const sortedIngredients = [...ingredients];
    sortedIngredients.sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedIngredients;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 text-gray-700" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-gray-700" />
    );
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

  const renderCell = (ingredient, field) => {
    if (editingId === ingredient.id) {
      if (field === 'defaultUnit') {
        return (
          <select
            value={editValues[field]}
            onChange={(e) => handleEditChange(field, e.target.value)}
            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AVAILABLE_UNITS.map(unit => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        );
      }
      return (
        <input
          type={field === 'defaultAmount' ? 'number' : 'text'}
          value={editValues[field]}
          onChange={(e) => handleEditChange(field, e.target.value)}
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
    return ingredient[field];
  };

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen">
        {/* Main content */}
        <div className="flex-grow bg-white shadow-sm rounded-lg p-6 mb-16">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Manage Ingredients</h1>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon columnKey="name" />
                    </div>
                  </th>
                  <th 
                    className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-2">
                      Category
                      <SortIcon columnKey="category" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Unit</th>
                  <th 
                    className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Date Added
                      <SortIcon columnKey="createdAt" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedIngredients().map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {renderCell(ingredient, 'name')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {renderCell(ingredient, 'category')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {renderCell(ingredient, 'defaultAmount')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {renderCell(ingredient, 'defaultUnit')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(ingredient.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        {editingId === ingredient.id ? (
                          <>
                            <button
                              onClick={() => saveChanges(ingredient.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Save changes"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel editing"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(ingredient)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit ingredient"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(ingredient)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete ingredient"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCleanupDuplicates}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Clean Duplicates
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Ingredient
              </button>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        <AddIngredientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddIngredient}
        />
      </div>
    </AdminLayout>
  );
} 