import { FC, useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Recipe, Tag } from '../../types';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  tags: Tag[];
  onFavorite?: (recipeId: string) => Promise<void>;
  favorites?: Set<string>;
}

const RecipeList: FC<RecipeListProps> = ({ tags, onFavorite, favorites = new Set() }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesQuery = query(
          collection(db, 'recipes'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(recipesQuery);
        const recipesData = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Recipe));
        
        setRecipes(recipesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          tags={tags}
          onFavorite={onFavorite}
          isFavorited={favorites.has(recipe.id)}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default RecipeList; 