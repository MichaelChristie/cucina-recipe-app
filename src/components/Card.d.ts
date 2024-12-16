import { FC } from 'react';
import { Recipe, Tag } from '../types/admin';

interface CardProps {
  recipe: Recipe;
  tags: Tag[];
  className?: string;
}

declare const Card: FC<CardProps>;
export default Card; 