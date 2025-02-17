export type TagCategory = 'meal type' | 'cuisine' | 'dietary' | 'style' | 'season' | 'method';

export const TAG_CATEGORIES: TagCategory[] = [
  'meal type',
  'cuisine',
  'dietary',
  'style',
  'season',
  'method'
];

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  description?: string;
} 