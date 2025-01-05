import { Timestamp } from 'firebase/firestore';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export interface Tag {
  id?: string;
  name: string;
  emoji: string;
  category: string;
  active: boolean;
}

export const TAG_CATEGORIES = [
  'meal type',
  'cuisine',
  'dietary',
  'style',
  'season',
  'method'
] as const;

export type TagCategory = typeof TAG_CATEGORIES[number];

export const DEFAULT_TAGS: Omit<Tag, 'id'>[] = [
  // Meal Type
  { name: 'Breakfast', emoji: '🍳', category: 'meal type', active: true },
  { name: 'Lunch', emoji: '🥪', category: 'meal type', active: true },
  { name: 'Dinner', emoji: '🍽️', category: 'meal type', active: true },
  { name: 'Snack', emoji: '🍿', category: 'meal type', active: true },
  { name: 'Dessert', emoji: '🍰', category: 'meal type', active: true },
  { name: 'Appetizer', emoji: '🥗', category: 'meal type', active: true },
  { name: 'Side Dish', emoji: '🥔', category: 'meal type', active: true },
  { name: 'Drink', emoji: '🥤', category: 'meal type', active: true },

  // Cuisine
  { name: 'Italian', emoji: '🇮🇹', category: 'cuisine', active: true },
  { name: 'Mexican', emoji: '🇲🇽', category: 'cuisine', active: true },
  { name: 'Chinese', emoji: '🇨🇳', category: 'cuisine', active: true },
  { name: 'Japanese', emoji: '🇯🇵', category: 'cuisine', active: true },
  { name: 'Indian', emoji: '🇮🇳', category: 'cuisine', active: true },
  { name: 'Thai', emoji: '🇹🇭', category: 'cuisine', active: true },
  { name: 'Mediterranean', emoji: '🫒', category: 'cuisine', active: true },
  { name: 'American', emoji: '🇺🇸', category: 'cuisine', active: true },
  { name: 'French', emoji: '🇫🇷', category: 'cuisine', active: true },
  { name: 'Korean', emoji: '🇰🇷', category: 'cuisine', active: true },
  { name: 'Vietnamese', emoji: '🇻🇳', category: 'cuisine', active: true },
  { name: 'Greek', emoji: '🇬🇷', category: 'cuisine', active: true },

  // Dietary
  { name: 'Vegetarian', emoji: '🥬', category: 'dietary', active: true },
  { name: 'Vegan', emoji: '🌱', category: 'dietary', active: true },
  { name: 'Gluten Free', emoji: '🌾', category: 'dietary', active: true },
  { name: 'Dairy Free', emoji: '🥛', category: 'dietary', active: true },
  { name: 'Low Carb', emoji: '🥖', category: 'dietary', active: true },
  { name: 'Keto', emoji: '🥑', category: 'dietary', active: true },
  { name: 'Paleo', emoji: '🍖', category: 'dietary', active: true },
  { name: 'Whole30', emoji: '🥩', category: 'dietary', active: true },

  // Style
  { name: 'Quick', emoji: '⚡️', category: 'style', active: true },
  { name: 'Easy', emoji: '👶', category: 'style', active: true },
  { name: 'Healthy', emoji: '💪', category: 'style', active: true },
  { name: 'Fresh', emoji: '🫐', category: 'style', active: true },
  { name: 'Comfort', emoji: '🛋️', category: 'style', active: true },
  { name: 'Spicy', emoji: '🌶️', category: 'style', active: true },
  { name: 'Sweet', emoji: '🍯', category: 'style', active: true },
  { name: 'Savory', emoji: '🧂', category: 'style', active: true },
  { name: 'Gourmet', emoji: '👨‍🍳', category: 'style', active: true },
  { name: 'Budget', emoji: '💰', category: 'style', active: true },
  { name: 'Meal Prep', emoji: '📦', category: 'style', active: true },
  { name: 'One Pot', emoji: '🥘', category: 'style', active: true },

  // Season
  { name: 'Spring', emoji: '🌸', category: 'season', active: true },
  { name: 'Summer', emoji: '☀️', category: 'season', active: true },
  { name: 'Fall', emoji: '🍂', category: 'season', active: true },
  { name: 'Winter', emoji: '❄️', category: 'season', active: true },
  { name: 'Holiday', emoji: '🎄', category: 'season', active: true },

  // Method
  { name: 'Grilled', emoji: '🔥', category: 'method', active: true },
  { name: 'Baked', emoji: '🥖', category: 'method', active: true },
  { name: 'Fried', emoji: '🍳', category: 'method', active: true },
  { name: 'Slow Cooker', emoji: '🐌', category: 'method', active: true },
  { name: 'Instant Pot', emoji: '⚡️', category: 'method', active: true },
  { name: 'Air Fryer', emoji: '🌪️', category: 'method', active: true },
  { name: 'No Cook', emoji: '❄️', category: 'method', active: true },
  { name: 'Smoked', emoji: '💨', category: 'method', active: true }
];

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  defaultAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngredientInRecipe {
  ingredientId: string;
  amount: number;
  unit: string;
}

export interface RecipeStep {
  text: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
} 