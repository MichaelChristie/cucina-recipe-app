import React, { useEffect, useState } from 'react'
import { MdOutlineFavoriteBorder, MdOutlineEggAlt, MdOutlineLunchDining, MdOutlineDinnerDining, MdOutlineRestaurant } from 'react-icons/md'
import { getTags } from '../services/tagService'
import { getRecipes } from '../services/recipeService'
import Card from './Card'

function IntroHeroLaunch() {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [fetchedTags, fetchedRecipes] = await Promise.all([
        getTags(),
        getRecipes()
      ]);
      setTags(fetchedTags);
      setRecipes(fetchedRecipes);
    };
    loadData();
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    if (selectedTags.length === 0) return true;
    return recipe.tags?.some(tagId => selectedTags.includes(tagId));
  });

  return (
    <div className="w-full">
      {/* Login screen example */}
      <div className="bg-white p-8 rounded-2xl">
        <h1 className="font-display text-display-large text-tasty-green mb-8">
          Find Your Next Favorite Dish
        </h1>
        


        {/* Category buttons and search bar - now with flex-wrap and responsive layout */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag.id)
                      ? prev.filter(id => id !== tag.id)
                      : [...prev, tag.id]
                  );
                }}
                className={`flex items-center gap-1 px-3 py-2 border rounded-lg transition-colors
                  ${selectedTags.includes(tag.id)
                    ? 'bg-tasty-green text-white border-tasty-green'
                    : 'border-tasty-green text-tasty-green hover:bg-tasty-green/10'
                  }`}
              >
                <span>{tag.emoji}</span>
                <span>{tag.name}</span>
              </button>
            ))}
          </div>
          
          <div className="flex w-full">
            <div className="relative flex-1">
              <input 
                type="text"
                className="w-full border border-tasty-green rounded-l-lg px-4 py-2 pl-10 text-tasty-green placeholder-tasty-green/60"
                placeholder="Search your favourite dish"
              />
              {/* <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-tasty-green/60 text-lg" /> */}
            </div>
            <button className="px-4 py-2 bg-tasty-green border border-tasty-green rounded-r-lg text-white font-medium hover:bg-tasty-green/90">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Recipe cards grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 [grid-auto-rows:1fr]">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="h-full flex flex-col">
              <Card 
                recipe={recipe} 
                tags={tags}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntroHeroLaunch 