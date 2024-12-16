import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Recipe } from '../../types';
import RecipeCard from './RecipeCard';

const RecipeList = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const recipesQuery = query(
          collection(db, 'recipes'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(recipesQuery);
        const recipesData: Recipe[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
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

  const handleFavorite = (recipeId: string) => {
    setFavorites(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onFavorite={handleFavorite}
          isFavorited={favorites.includes(recipe.id)}
        />
      ))}
    </div>
  );
};

export default RecipeList; 