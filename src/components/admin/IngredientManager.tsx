const AVAILABLE_UNITS = [
  'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup',
  'oz', 'lb', 'whole', 'clove', 'pinch', 'slice'
] as const;

type AvailableUnit = typeof AVAILABLE_UNITS[number];

const AVAILABLE_CATEGORIES = [
  'Baking',
  'Dairy & Eggs',
  'Meat',
  'Seafood',
  'Vegetables',
  'Fruits',
  'Seasonings',
  'Oils',
  'Grains',
  'Condiments',
  'Liquids',
  'Nuts & Seeds'
] as const;

type AvailableCategory = typeof AVAILABLE_CATEGORIES[number];

interface EditValues {
  name: string;
  category: AvailableCategory;
  defaultAmount: number;
  defaultUnit: AvailableUnit;
} 