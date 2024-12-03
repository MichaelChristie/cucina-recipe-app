import { Link } from 'react-router-dom';

export default function Card({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
          <p className="text-gray-600">{recipe.description}</p>
        </div>
      </div>
    </Link>
  );
} 