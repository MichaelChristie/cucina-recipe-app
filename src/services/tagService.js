// This is a mock implementation. Replace with actual API calls.
let tags = [
  // Diet Category
  { id: 1, name: 'Vegetarian', emoji: '🥬', category: 'diet' },
  { id: 2, name: 'Vegan', emoji: '🌱', category: 'diet' },
  { id: 3, name: 'Gluten Free', emoji: '🌾', category: 'diet' },
  { id: 4, name: 'Keto', emoji: '🥑', category: 'diet' },
  { id: 5, name: 'Low Carb', emoji: '🥗', category: 'diet' },
  { id: 6, name: 'Healthy', emoji: ' 💪', category: 'diet' },
  { id: 7, name: 'Naughty', emoji: '🍟', category: 'diet' },
  
  // Meal Category
  { id: 8, name: 'Breakfast', emoji: '🍳', category: 'meal' },
  { id: 9, name: 'Lunch', emoji: '🥪', category: 'meal' },
  { id: 10, name: 'Dinner', emoji: '🍽️', category: 'meal' },
  { id: 11, name: 'Dessert', emoji: '🍰', category: 'meal' },
  { id: 12, name: 'Snack', emoji: '🍿', category: 'meal' },
  
  // Cuisine Category
  { id: 13, name: 'Italian', emoji: '🇮🇹', category: 'cuisine' },
  { id: 14, name: 'Mexican', emoji: '🇲🇽', category: 'cuisine' },
  { id: 15, name: 'Chinese', emoji: '🇨🇳', category: 'cuisine' },
  { id: 16, name: 'Japanese', emoji: '🇯🇵', category: 'cuisine' },
  { id: 17, name: 'Indian', emoji: '🇮🇳', category: 'cuisine' },
  { id: 18, name: 'Thai', emoji: '🇹🇭', category: 'cuisine' },
  { id: 19, name: 'French', emoji: '🇫🇷', category: 'cuisine' },
  { id: 20, name: 'American', emoji: '🇺🇸', category: 'cuisine' },
  { id: 21, name: 'British', emoji: '🇬🇧', category: 'cuisine' },
  { id: 22, name: 'Middle Eastern', emoji: '🥙', category: 'cuisine' },
  
  // Style Category
  { id: 23, name: 'Quick & Easy', emoji: '⚡', category: 'style' },
  { id: 24, name: 'Gourmet', emoji: '👨‍🍳', category: 'style' },
  { id: 25, name: 'Comfort Food', emoji: '🏠', category: 'style' },
  { id: 27, name: 'Budget', emoji: '💰', category: 'style' },
  { id: 28, name: 'One Pot', emoji: '🥘', category: 'style' }
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