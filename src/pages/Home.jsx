import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import IntroHeroLaunch from '../components/IntroHeroLaunch';
import Card from '../components/Card';
import { getAllRecipes } from '../services/recipeService';

export default function Home() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const recipesData = await getAllRecipes();
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    loadRecipes();
  }, []);

  return (
    <Layout>
      <IntroHeroLaunch />
      
      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes && recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Card 
              key={recipe.id}
              title={recipe.title}
              description={recipe.description}
              image={recipe.image}
            />
          ))
        ) : (
          <p>No recipes found</p>
        )}
      </div>
    </Layout>
  );
} 