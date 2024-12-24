import { FC } from 'react';
import { Link } from 'react-router-dom';
import { MdAccessTime, MdPeople } from 'react-icons/md';
import { Recipe, Tag } from '../types/recipe';
import { getPriorityTags } from '../utils/tagUtils';

interface CardProps {
  recipe: Recipe;
  tags: Tag[];
  className?: string;
  onTagClick?: (tagId: string, category: string) => void;
}

const Card: FC<CardProps> = ({ recipe, tags, className, onTagClick }) => {
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
          
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm flex-1">
            {recipe.description}
          </p>
          
          {/* Priority Tags */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {getPriorityTags(recipe.tags || [], tags).map(tag => (
              <button
                key={tag.id}
                onClick={(e) => {
                  e.preventDefault(); // Prevent Link navigation
                  if (onTagClick) {
                    onTagClick(tag.id, tag.category);
                  }
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tasty-green/10 text-tasty-green hover:bg-tasty-green/20 transition-colors"
              >
                {tag.emoji} {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card; 