import { Recipe, RecipeIngredient, IngredientDivider, Difficulty } from '../../types/recipe';
import { Tag, TagCategory, TAG_CATEGORIES } from '../../types/tag';
import { updateRecipe } from '../../services/recipeService';
import { isIngredientDivider } from '../../utils/typeGuards';

const isRecipeIngredient = (ingredient: RecipeIngredient | IngredientDivider): ingredient is RecipeIngredient => {
  return !isIngredientDivider(ingredient);
};

const isTag = (value: string | Tag): value is Tag => {
  return typeof value === 'object' && value !== null && 'id' in value;
};

const handleIngredientProcessing = (ingredient: RecipeIngredient | IngredientDivider) => {
  if (isIngredientDivider(ingredient)) {
    return ingredient;
  }
  return {
    id: ingredient.id,
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    defaultUnit: ingredient.defaultUnit,
    confirmed: ingredient.confirmed || false
  } as RecipeIngredient;
};

const processIngredients = (ingredients: Array<RecipeIngredient | IngredientDivider>) => {
  return ingredients.map(handleIngredientProcessing);
};

const handleTagProcessing = (tagId: string, tags: Tag[]) => {
  const foundTag = tags.find(t => t.id === tagId);
  return foundTag ? foundTag.id : tagId;
};

const handleTagSuggestions = async (recipe: Recipe, tags: Tag[]) => {
  const existingCategories = new Set<TagCategory>(
    tags
      .filter(tag => recipe.tags.includes(tag.id))
      .map(tag => tag.category)
      .filter((category): category is TagCategory => 
        TAG_CATEGORIES.includes(category as TagCategory)
      )
  );

  const suggestedTags = TAG_CATEGORIES
    .filter(category => !existingCategories.has(category))
    .map(category => {
      const suggestions: Tag[] = [];
      
      // Check ingredients
      recipe.ingredients.forEach(ingredient => {
        if (isRecipeIngredient(ingredient)) {
          tags
            .filter(tag => tag.category === category)
            .forEach(tag => {
              if (ingredient.name.toLowerCase().includes(tag.name.toLowerCase())) {
                suggestions.push(tag);
              }
            });
        }
      });

      return suggestions;
    })
    .flat();

  if (suggestedTags.length > 0) {
    const uniqueTagIds = suggestedTags.map(tag => tag.id);
    const updatedTags = [...new Set([...recipe.tags, ...uniqueTagIds])];
    await updateRecipe(recipe.id, { 
      ...recipe,
      tags: updatedTags
    });
  }
};

const formatIngredients = (ingredients: Array<RecipeIngredient | IngredientDivider>): Array<RecipeIngredient | IngredientDivider> => {
  return ingredients.map(ingredient => {
    if (isIngredientDivider(ingredient)) {
      return ingredient;
    }
    return {
      id: ingredient.id || '',
      ingredientId: ingredient.ingredientId || '',
      name: ingredient.name || '',
      amount: ingredient.amount || 0,
      unit: ingredient.unit || '',
      defaultUnit: ingredient.defaultUnit || '',
      confirmed: ingredient.confirmed || false
    } as RecipeIngredient;
  });
};

const handleRecipeUpdate = async (recipeToUpdate: Recipe, tags: Tag[]) => {
  const uniqueTags = Array.from(new Set(
    recipeToUpdate.tags.map(tagId => {
      const foundTag = tags.find(t => t.id === tagId);
      return foundTag ? foundTag.id : tagId;
    })
  ));

  const updatedRecipe: Partial<Recipe> = {
    ...recipeToUpdate,
    ingredients: formatIngredients(recipeToUpdate.ingredients),
    difficulty: recipeToUpdate.difficulty as Difficulty,
    tags: uniqueTags
  };

  await updateRecipe(recipeToUpdate.id!, updatedRecipe);
}; 