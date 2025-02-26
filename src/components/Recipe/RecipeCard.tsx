import { FC } from 'react';
import { Recipe, Tag } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  tags: Tag[];
  onFavorite?: (recipeId: string) => Promise<void>;
  isFavorited?: boolean;
  loading?: boolean;
  showTags?: boolean;
}

const RecipeCard: FC<RecipeCardProps> = ({
  recipe,
  tags,
  onFavorite,
  isFavorited = false,
  loading = false,
  showTags = true
}) => {
  const handleFavoriteClick = () => {
    if (onFavorite) {
      onFavorite(recipe.id);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      {recipe.imageUrl && (
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-48 object-cover rounded-md"
        />
      )}
      <h3 className="text-xl font-semibold mt-2">{recipe.title}</h3>
      <p className="text-gray-600">{recipe.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {recipe.cookingTime} mins | {recipe.servings} servings
        </span>
        <button 
          onClick={handleFavoriteClick}
          className="text-red-500 hover:text-red-600"
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
};

export default RecipeCard; 