import { DocumentData, DocumentReference, CollectionReference } from 'firebase/firestore';
import { Recipe, Ingredient, Tag } from './index';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export type RecipeDoc = DocumentReference<Recipe>;
export type IngredientDoc = DocumentReference<Ingredient>;
export type TagDoc = DocumentReference<Tag>;

export type RecipeCollection = CollectionReference<Recipe>;
export type IngredientCollection = CollectionReference<Ingredient>;
export type TagCollection = CollectionReference<Tag>; 