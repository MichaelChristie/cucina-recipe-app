import { FC, useEffect, useState, useRef, KeyboardEvent } from 'react';
import { 
  HeartIcon, 
  ChevronDownIcon,
  XMarkIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { getTags } from '../services/tagService';
import { getRecipes } from '../services/recipeService';
import { getIngredients } from '../services/ingredientService';
import Card from './Card';
import { Recipe, Tag, Ingredient } from '../types/admin';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const IntroHeroLaunch: FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isIngredientSearchOpen, setIsIngredientSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const [fetchedTags, fetchedRecipes, fetchedIngredients] = await Promise.all([
        getTags(),
        getRecipes(),
        getIngredients()
      ]);
      setTags(fetchedTags);
      setRecipes(fetchedRecipes as Recipe[]);
      setIngredients(fetchedIngredients);
    };
    loadData();
  }, []);

  const categories: Category[] = [...new Set(tags.map(tag => tag.category))].map(category => {
    const emojis: Record<string, string> = {
      diet: '🌿',
      meal: '🍽️',
      cuisine: '🌍',
      style: '🥘',
      special: '🎉'
    };
    
    return {
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      emoji: emojis[category] || '📌'
    };
  });

  const getTagsByCategory = (category: string): Tag[] => {
    return tags.filter(tag => tag.category === category);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesTags = selectedTags.length === 0 || 
      recipe.tags?.some(tagId => selectedTags.includes(tagId));
    
    const matchesIngredients = selectedIngredients.length === 0 ||
      selectedIngredients.every(ingredientId =>
        recipe.ingredients?.some(ing => ing.ingredientId === ingredientId)
      );

    return matchesTags && matchesIngredients;
  });

  const handleCategoryClick = (category: string): void => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const getTagById = (tagId: string): Tag | undefined => {
    return tags.find(tag => tag.id === tagId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (!isSearchFocused || filteredIngredients.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredIngredients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const selectedIngredient = filteredIngredients[highlightedIndex];
          setSelectedIngredients(prev => [...prev, selectedIngredient.id]);
          setSearchTerm('');
          setIsSearchFocused(true);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredIngredients]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = ingredients.filter(
        ing => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedIngredients.includes(ing.id)
      );
      setFilteredIngredients(filtered);
    } else {
      setFilteredIngredients([]);
    }
  }, [searchTerm, ingredients, selectedIngredients]);

  return (
    <div className="w-full">
      {/* Your existing JSX with proper type annotations */}
      {/* ... */}
    </div>
  );
};

export default IntroHeroLaunch; 