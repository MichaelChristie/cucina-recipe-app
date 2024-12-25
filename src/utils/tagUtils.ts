import { Tag } from '../types/admin';

export const getCategoryFromTags = (recipeTags: string[], allTags: Tag[]): string => {
  const tagCategories: Record<string, number> = {
    'special': 1,
    'style': 2,
    'cuisine': 3,
    'meal': 4,
    'diet': 5
  };
  
  const matchingTags = allTags
    .filter(tag => recipeTags.includes(tag.id))
    .sort((a, b) => (tagCategories[a.category] || 999) - (tagCategories[b.category] || 999));

  return matchingTags[0]?.name || 'Food & Drink';
};

// If you have other tag-related utility functions, they can go here
export const getPriorityTags = (recipeTags: string[], allTags: Tag[]): Tag[] => {
  return allTags.filter(tag => recipeTags.includes(tag.id));
}; 