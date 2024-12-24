import { Recipe, Tag } from '../types/recipe';

export const getPriorityTags = (recipeTags: string[] | undefined, tags: Tag[]): Tag[] => {
  // If no tags are assigned, generate some default tags based on recipe properties
  if (!recipeTags || recipeTags.length === 0) {
    return [];
  }

  // Original priority tags logic
  const priorityCategories = ['special', 'style', 'cuisine'];
  return tags
    .filter(tag => 
      recipeTags.includes(tag.id) && 
      priorityCategories.includes(tag.category)
    )
    .slice(0, 2);
}; 