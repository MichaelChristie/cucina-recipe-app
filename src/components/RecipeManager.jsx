import { useState, useEffect } from 'react'
import { addRecipe, getAllRecipes, updateRecipe, deleteRecipe } from '../services/recipeService'
import { Link } from 'react-router-dom'

function RecipeManager() {
  const [recipes, setRecipes] = useState([])
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    image: ''
  })

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    const recipesData = await getAllRecipes()
    setRecipes(recipesData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!newRecipe.title.trim()) {
        alert('Please enter a recipe title')
        return
      }

      console.log('Attempting to add recipe:', newRecipe)
      await addRecipe(newRecipe)
      
      setNewRecipe({ 
        title: '', 
        description: '', 
        image: '' 
      })
      
      await loadRecipes()
      alert('Recipe added successfully!')
    } catch (error) {
      console.error('Detailed error:', error)
      alert(`Failed to add recipe: ${error.message}`)
    }
  }

  const handleDelete = async (id) => {
    await deleteRecipe(id)
    loadRecipes()
  }

  return (
    <div className="p-8">
      <Link to="/" className="text-blue-500 hover:text-blue-700 mb-4 block">
        ← Back to Recipes
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">Manage Recipes</h1>

      {/* Add Recipe Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Recipe Title"
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newRecipe.description}
            onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newRecipe.image}
            onChange={(e) => setNewRecipe({...newRecipe, image: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <button 
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Recipe
          </button>
        </div>
      </form>

      {/* Recipe List */}
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="border p-4 rounded">
            <h2 className="font-bold">{recipe.title}</h2>
            <p>{recipe.description}</p>
            <button
              onClick={() => handleDelete(recipe.id)}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm mt-2 hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecipeManager 