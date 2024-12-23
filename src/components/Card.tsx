import { FC } from 'react';
import { Link } from 'react-router-dom';
import { MdAccessTime, MdPeople } from 'react-icons/md';
import { Recipe, Tag } from '../types/recipe';

interface CardProps {
  recipe: Recipe;
  tags: Tag[];
  className?: string;
}

const Card: FC<CardProps> = ({ recipe, tags, className }) => {
  // Helper function to get image URL
  const getImageUrl = (recipe: Recipe): string => {
    if (typeof recipe.image === 'object' && recipe.image?.url) return recipe.image.url;
    if (recipe.imageUrl) return recipe.imageUrl;
    if (typeof recipe.image === 'string') return recipe.image;
    return '/placeholder-recipe.jpg';
  };

  return (
    <Link 
      to={`/recipe/${recipe.id}`} 
      className={`group h-full block ${className || ''}`}
      data-position={recipe.position}
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="aspect-video relative overflow-hidden">
          <img
            src={getImageUrl(recipe)}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = '/placeholder-recipe.jpg';
            }}
          />
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display text-lg font-medium text-gray-900 mb-2">
            {recipe.title}
          </h3>
          
          {/* Description - truncated to 2 lines */}
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
            {recipe.description}
          </p>
          
          {/* Meta information */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-auto">
            <div className="flex items-center gap-1">
              <MdAccessTime className="text-tasty-green" />
              <span>{recipe.cookingTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <MdPeople className="text-tasty-green" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.tags?.slice(0, 3).map(tagId => {
              const tag = tags?.find(t => t.id === tagId);
              return tag ? (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tasty-green/10 text-tasty-green text-sm"
                >
                  {tag.emoji} {tag.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card; 