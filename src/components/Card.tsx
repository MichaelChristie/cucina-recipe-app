import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Recipe, Tag } from '../types';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { auth } from '../config/firebase';
import { getValidTags } from '../utils/tagUtils';

interface CardProps {
  recipe: Recipe;
  tags: Tag[];
  isFavorite?: boolean;
  onToggleFavorite?: (recipeId: string) => void;
}

const Card: FC<CardProps> = ({ recipe, tags, isFavorite = false, onToggleFavorite }) => {
  const isAuthenticated = auth.currentUser !== null;

  const recipeTags = getValidTags(recipe.tags || [], tags);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite && isAuthenticated) {
      onToggleFavorite(recipe.id);
    }
  };

  return (
    <div className="relative">
      <div 
        className="absolute top-2 right-2 z-10 cursor-pointer"
        onClick={handleFavoriteClick}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          type="button"
          className={`${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={!isAuthenticated}
          title={!isAuthenticated ? "Login to save favorites" : undefined}
        >
          {isFavorite ? (
            <HeartSolid 
              className="w-6 h-6 text-cookred-600 filter drop-shadow 
                       transform transition-all duration-300
                       hover:scale-110" 
            />
          ) : (
            <HeartIcon 
              className="w-6 h-6 text-white filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                       hover:text-cookred-600 transform transition-all duration-300
                       hover:scale-110" 
            />
          )}
        </button>
      </div>

      <Link 
        to={`/recipe/${recipe.id}`}
        className="block"
      >
        <div className="rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="relative aspect-[4/3] overflow-hidden group">
            <img
              src={recipe.image || '/placeholder-recipe.jpg'}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          <div className="py-4">
            <h3 className="font-display text-xl mb-2 text-gray-900 truncate">
              {recipe.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 overflow-hidden line-clamp-2">
              {recipe.description}
            </p>

            {recipe.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {getValidTags(recipe.tags, tags).map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full 
                               text-xs font-medium bg-olive-50 text-olive-600"
                  >
                    {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card; 