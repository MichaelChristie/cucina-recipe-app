import { useState } from 'react';
import Navbar from '../components/Navbar';
import IntroHeroLaunch from '../components/IntroHeroLaunch';
import Card from '../components/Card';

export default function Home({ recipes }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
        <IntroHeroLaunch />
          
          {/* Recipe Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes && recipes.map((recipe) => (
              <Card 
                key={recipe.id}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 