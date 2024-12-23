import { FC } from 'react';
import Card from './Card';
import { useOrderedRecipes } from '../hooks/useOrderedRecipes';

interface RecipeGridProps {
  tags: Tag[];
}

const RecipeGrid: FC<RecipeGridProps> = ({ tags }) => {
  const { recipes, loading, error } = useOrderedRecipes();

  if (loading) {
    return <div>Loading recipes...</div>;
  }

  if (error) {
    return <div>Error loading recipes: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <Card
          key={recipe.id}
          recipe={recipe}
          tags={tags}
        />
      ))}
    </div>
  );
};

export default RecipeGrid; 