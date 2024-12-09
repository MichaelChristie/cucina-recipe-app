// This is a mock implementation. Replace with actual API calls.
let tags = [
  // Diet Category
  { id: 1, name: 'Vegetarian', emoji: '🥬', category: 'diet' },
  { id: 2, name: 'Vegan', emoji: '🌱', category: 'diet' },
  { id: 3, name: 'Gluten-Free', emoji: '🌾', category: 'diet' },
  { id: 4, name: 'Keto', emoji: '🥑', category: 'diet' },
  { id: 5, name: 'Low-Carb', emoji: '🥗', category: 'diet' },
  { id: 6, name: 'Healthy', emoji: '💪', category: 'diet' },
  { id: 7, name: 'High-Protein', emoji: '🍗', category: 'diet' },
  { id: 8, name: 'Low-Fat', emoji: '🎯', category: 'diet' },
  { id: 9, name: 'Low-Calorie', emoji: '⚖️', category: 'diet' },
  { id: 10, name: 'Dairy-Free', emoji: '🥛', category: 'diet' },
  { id: 11, name: 'Paleo', emoji: '🦕', category: 'diet' },
  { id: 12, name: 'Naughty', emoji: '🌭', category: 'diet' },

  // Meal Category
  { id: 13, name: 'Breakfast', emoji: '🍳', category: 'meal' },
  { id: 14, name: 'Brunch', emoji: '🥐', category: 'meal' },
  { id: 15, name: 'Lunch', emoji: '🥪', category: 'meal' },
  { id: 16, name: 'Dinner', emoji: '🍽️', category: 'meal' },
  { id: 17, name: 'Dessert', emoji: '🍰', category: 'meal' },
  { id: 18, name: 'Snack', emoji: '🍿', category: 'meal' },
  { id: 19, name: 'Appetizer', emoji: '🥗', category: 'meal' },
  { id: 20, name: 'Side Dish', emoji: '🥘', category: 'meal' },
  { id: 21, name: 'Main Course', emoji: '🍖', category: 'meal' },
  { id: 22, name: 'Soup', emoji: '🥣', category: 'meal' },
  { id: 23, name: 'Salad', emoji: '🥗', category: 'meal' },

  // Cuisine Category
  { id: 24, name: 'Italian', emoji: '🇮🇹', category: 'cuisine' },
  { id: 25, name: 'French', emoji: '🇫🇷', category: 'cuisine' },
  { id: 26, name: 'Mediterranean', emoji: '🫒', category: 'cuisine' },
  { id: 27, name: 'Asian', emoji: '🥢', category: 'cuisine' },
  { id: 28, name: 'Chinese', emoji: '🇨🇳', category: 'cuisine' },
  { id: 29, name: 'Japanese', emoji: '🇯🇵', category: 'cuisine' },
  { id: 30, name: 'Thai', emoji: '🇹🇭', category: 'cuisine' },
  { id: 31, name: 'Indian', emoji: '🇮🇳', category: 'cuisine' },
  { id: 32, name: 'Mexican', emoji: '🇲🇽', category: 'cuisine' },
  { id: 33, name: 'American', emoji: '🇺🇸', category: 'cuisine' },
  { id: 34, name: 'Middle Eastern', emoji: '🥙', category: 'cuisine' },
  { id: 35, name: 'Greek', emoji: '🇬🇷', category: 'cuisine' },
  { id: 36, name: 'Spanish', emoji: '🇪🇸', category: 'cuisine' },
  { id: 37, name: 'Vietnamese', emoji: '🇻🇳', category: 'cuisine' },
  { id: 38, name: 'Korean', emoji: '🇰🇷', category: 'cuisine' },

  // Style Category
  { id: 39, name: 'Quick & Easy', emoji: '⚡', category: 'style' },
  { id: 40, name: 'One-Pot', emoji: '🥘', category: 'style' },
  { id: 41, name: 'Slow Cooker', emoji: '🐌', category: 'style' },
  { id: 42, name: 'Budget-Friendly', emoji: '💰', category: 'style' },
  { id: 43, name: 'Meal Prep', emoji: '📦', category: 'style' },
  { id: 44, name: 'Batch Cooking', emoji: '🏭', category: 'style' },
  { id: 45, name: 'No-Cook', emoji: '❄️', category: 'style' },
  { id: 46, name: 'Grilled', emoji: '🔥', category: 'style' },
  { id: 47, name: 'Baked', emoji: '🥖', category: 'style' },
  { id: 48, name: 'Fried', emoji: '🍟', category: 'style' },
  { id: 49, name: 'Steamed', emoji: '♨️', category: 'style' },
  { id: 50, name: 'BBQ', emoji: '🍖', category: 'style' },
  { id: 51, name: 'Party Food', emoji: '🎉', category: 'style' },
  { id: 52, name: 'Family Meals', emoji: '👨‍👩‍👧‍👦', category: 'style' },
  { id: 53, name: 'Kid-Friendly', emoji: '🧒', category: 'style' },

  // Special Category
  { id: 54, name: 'Holiday', emoji: '🎄', category: 'special' },
  { id: 55, name: 'Christmas', emoji: '🎅', category: 'special' },
  { id: 56, name: 'Thanksgiving', emoji: '🦃', category: 'special' },
  { id: 57, name: 'Halloween', emoji: '🎃', category: 'special' },
  { id: 58, name: 'Summer', emoji: '☀️', category: 'special' },
  { id: 59, name: 'Winter', emoji: '❄️', category: 'special' },
  { id: 60, name: 'Spring', emoji: '🌸', category: 'special' },
  { id: 61, name: 'Fall', emoji: '🍂', category: 'special' },
  { id: 62, name: 'Date Night', emoji: '💝', category: 'special' },
  { id: 63, name: 'Picnic', emoji: '🧺', category: 'special' },
  { id: 64, name: 'Game Day', emoji: '🏈', category: 'special' }
];

export const getTags = async () => {
  return tags;
};

export const createTag = async (tag) => {
  const newTag = {
    id: Math.max(...tags.map(t => t.id)) + 1,
    ...tag
  };
  tags.push(newTag);
  return newTag;
};

export const updateTag = async (id, tag) => {
  tags = tags.map(t => t.id === id ? { ...t, ...tag } : t);
  return tag;
};

export const deleteTag = async (id) => {
  tags = tags.filter(t => t.id !== id);
}; 