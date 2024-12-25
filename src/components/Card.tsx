import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Recipe, Tag } from '../types';

interface CardProps {
  recipe: Recipe;
  tags: Tag[];
  maxTags?: number;
}

const Card: FC<CardProps> = ({ recipe, tags, maxTags = 3 }) => {
  const recipeTags = recipe.tags || [];
  const visibleTags = recipeTags.slice(0, maxTags);
  const hiddenTagsCount = recipeTags.length - maxTags;

  return (
    <Link to={`/recipe/${recipe.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={recipe.image || '/placeholder-recipe.jpg'}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Content Container */}
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold mb-2 text-gray-900 truncate">
            {recipe.title}
          </h3>
          
          {/* Description - Limited to 2 lines */}
          <p className="text-sm text-gray-600 mb-3 overflow-hidden line-clamp-2">
            {recipe.description}
          </p>

          {/* Tags Container - Single line with overflow hidden */}
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="flex gap-2 items-center flex-nowrap overflow-hidden">
              {visibleTags.map((tagId) => {
                const tag = tags.find(t => t.id === tagId);
                return tag ? (
                  <span
                    key={tag.id}
                    className="inline-flex items-center shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-olive-50 text-olive-600"
                  >
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>
            {hiddenTagsCount > 0 && (
              <span className="inline-flex items-center shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{hiddenTagsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card; 