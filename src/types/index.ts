export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  imageUrl?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  position?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  favorites: string[]; // Recipe IDs
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
} 