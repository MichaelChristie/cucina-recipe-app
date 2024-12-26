import { FC, useState, useEffect } from 'react';
import Card from './Card';
import { useOrderedRecipes } from '../hooks/useOrderedRecipes';
import { favoriteService } from '../services/favoriteService';
import { auth } from '../config/firebase';

interface RecipeGridProps {
  tags: Tag[];
  selectedTags?: string[];
  selectedIngredients?: Ingredient[];
}

const RecipeGrid: FC<RecipeGridProps> = ({ 
  tags, 
  selectedTags = [], 
  selectedIngredients = [] 
}) => {
  const { recipes, loading, error } = useOrderedRecipes();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Update filtering logic to handle both tags and ingredients
  const filteredRecipes = recipes.filter(recipe => {
    // First check tags
    const matchesTags = selectedTags.length === 0 || selectedTags.some(selectedTagId => 
      recipe.tags?.some(recipeTag => {
        const recipeTagId = typeof recipeTag === 'object' ? recipeTag.id : recipeTag;
        return String(recipeTagId) === String(selectedTagId);
      })
    );

    // Then check ingredients
    const matchesIngredients = selectedIngredients.length === 0 || selectedIngredients.every(selectedIngredient =>
      recipe.ingredients?.some(recipeIngredient => 
        recipeIngredient.ingredientId === selectedIngredient.id
      )
    );

    // Recipe must match both conditions
    return matchesTags && matchesIngredients;
  });

  useEffect(() => {
    // Load favorites when component mounts or auth state changes
    const loadFavorites = async () => {
      if (auth.currentUser) {
        const userFavorites = await favoriteService.getFavorites();
        setFavorites(new Set(userFavorites));
      } else {
        setFavorites(new Set());
      }
    };

    loadFavorites();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadFavorites();
      } else {
        setFavorites(new Set());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleFavorite = async (recipeId: string) => {
    if (!auth.currentUser) return;

    const isFavorited = await favoriteService.toggleFavorite(recipeId);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorited) {
        newFavorites.add(recipeId);
      } else {
        newFavorites.delete(recipeId);
      }
      return newFavorites;
    });
  };

  if (loading) {
    return <div>Loading recipes...</div>;
  }

  if (error) {
    return <div>Error loading recipes: {error.message}</div>;
  }

  return (
    <div className="px-8 sm:px-6 lg:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filteredRecipes.map((recipe) => (
          <Card
            key={recipe.id}
            recipe={recipe}
            tags={tags}
            isFavorite={favorites.has(recipe.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeGrid; 