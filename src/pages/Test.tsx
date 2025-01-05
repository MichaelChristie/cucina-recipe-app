import { useState } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface RecipeCard {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export default function Test() {
  const [searchQuery, setSearchQuery] = useState('');

  // Updated mock recipe data
  const recipes: RecipeCard[] = [
    {
      id: 1,
      title: "Classic Margherita Pizza",
      description: "Traditional Italian pizza with fresh basil, mozzarella, and tomato sauce",
      imageUrl: "https://placehold.co/400x300/ff9900/ffffff?text=Pizza"
    },
    {
      id: 2,
      title: "Vegetarian Buddha Bowl",
      description: "Healthy bowl filled with quinoa, roasted vegetables, and tahini dressing",
      imageUrl: "https://placehold.co/400x300/66cc33/ffffff?text=Buddha+Bowl"
    },
    {
      id: 3,
      title: "Spicy Ramen Noodles",
      description: "Japanese-style ramen with rich broth, soft-boiled egg, and tender pork",
      imageUrl: "https://placehold.co/400x300/cc3300/ffffff?text=Ramen"
    },
    {
      id: 4,
      title: "Mediterranean Salad",
      description: "Fresh salad with feta cheese, olives, tomatoes, and cucumber",
      imageUrl: "https://placehold.co/400x300/33cc99/ffffff?text=Salad"
    },
    {
      id: 5,
      title: "Chocolate Lava Cake",
      description: "Decadent dessert with warm, flowing chocolate center",
      imageUrl: "https://placehold.co/400x300/663399/ffffff?text=Chocolate+Cake"
    },
    {
      id: 6,
      title: "Grilled Salmon",
      description: "Fresh Atlantic salmon with lemon herb butter sauce",
      imageUrl: "https://placehold.co/400x300/ff6633/ffffff?text=Salmon"
    },
    {
      id: 7,
      title: "Mushroom Risotto",
      description: "Creamy Italian rice dish with wild mushrooms and parmesan",
      imageUrl: "https://placehold.co/400x300/996633/ffffff?text=Risotto"
    },
    {
      id: 8,
      title: "Beef Tacos",
      description: "Street-style tacos with seasoned beef, onions, and cilantro",
      imageUrl: "https://placehold.co/400x300/cc6600/ffffff?text=Tacos"
    },
    {
      id: 9,
      title: "Green Smoothie Bowl",
      description: "Nutritious smoothie bowl with spinach, banana, and superfood toppings",
      imageUrl: "https://placehold.co/400x300/33cc33/ffffff?text=Smoothie"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://placehold.co/1920x1080/334455/ffffff?text=Delicious+Recipes')"
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Search Controls */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Discover Amazing Recipes
          </h1>
          
          <div className="w-full max-w-2xl flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full px-4 py-3 pl-10 rounded-lg shadow-lg"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="bg-white p-3 rounded-lg shadow-lg">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {recipe.title}
                </h3>
                <p className="text-gray-600">
                  {recipe.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 