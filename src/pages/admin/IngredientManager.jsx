import { useState, useEffect } from 'react';
import { 
  getIngredients, 
  addIngredient, 
  updateIngredient, 
  deleteIngredient 
} from '../../services/ingredientService';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    const data = await getIngredients();
    setIngredients(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateIngredient(editingId, newIngredient);
    } else {
      await addIngredient(newIngredient);
    }
    setNewIngredient({ name: '', category: '' });
    setEditingId(null);
    loadIngredients();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      await deleteIngredient(id);
      loadIngredients();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ingredient Management</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
            placeholder="Ingredient name"
            className="flex-1 rounded-lg border-gray-300"
            required
          />
          <input
            type="text"
            value={newIngredient.category}
            onChange={(e) => setNewIngredient({...newIngredient, category: e.target.value})}
            placeholder="Category (e.g., Vegetables, Dairy)"
            className="flex-1 rounded-lg border-gray-300"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-tasty-green text-white rounded-lg hover:bg-tasty-green/90"
          >
            {editingId ? 'Update' : 'Add'} Ingredient
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div>
              <h3 className="font-medium">{ingredient.name}</h3>
              <p className="text-sm text-gray-500">{ingredient.category}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(ingredient.id);
                  setNewIngredient({
                    name: ingredient.name,
                    category: ingredient.category
                  });
                }}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(ingredient.id)}
                className="p-2 text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 