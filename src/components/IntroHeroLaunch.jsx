import React from 'react'
import { MdOutlineFavoriteBorder, MdOutlineEggAlt, MdOutlineLunchDining, MdOutlineDinnerDining, MdOutlineRestaurant } from 'react-icons/md'

function IntroHeroLaunch() {
  return (
    <div className="w-full">
      {/* Login screen example */}
      <div className="bg-white p-8 rounded-2xl">
        <h1 className="font-display text-display-large text-tasty-green mb-8">
          Find Your Next Favorite Dish with Tasty
        </h1>
        


        {/* Category buttons and search bar - now with flex-wrap and responsive layout */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1 px-3 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10">
              <MdOutlineFavoriteBorder className="text-lg" />
              <span>Healthy</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10">
              <MdOutlineEggAlt className="text-lg" />
              <span>Breakfast</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10">
              <MdOutlineLunchDining className="text-lg" />
              <span>Lunch</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10">
              <MdOutlineDinnerDining className="text-lg" />
              <span>Dinner</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-2 border border-tasty-green rounded-lg text-tasty-green hover:bg-tasty-green/10">
              <MdOutlineRestaurant className="text-lg" />
              <span>Restaurant</span>
            </button>
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

      {/* Main content example */}
      <div className="p-4">

      </div>
    </div>
  )
}

export default IntroHeroLaunch 