import { FC } from 'react';
import { Tag } from '../types/admin';

interface RecipeCardProps {
  tags?: string[];
  allTags: Tag[];
}

const getValidTags = (tags: string[] | undefined, allTags: Tag[]) => {
  if (!tags) return [];
  return tags.filter(tagId => allTags.some(t => t.id === tagId));
};

const RecipeCard: FC<RecipeCardProps> = ({ tags, allTags }) => {
  return (
    <div>
      {tags && (
        <div>
          {getValidTags(tags, allTags).map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeCard; 