import { useState, useEffect } from 'react';
import { getRecipes } from '../services/recipeService';
import { Recipe } from '../types';

export const useOrderedRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipes();
        // Sort by position explicitly
        const sortedRecipes = data.sort((a, b) => {
          const posA = a.position ?? Number.MAX_VALUE;
          const posB = b.position ?? Number.MAX_VALUE;
          return posA - posB;
        });
        setRecipes(sortedRecipes);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return { recipes, loading, error };
}; 