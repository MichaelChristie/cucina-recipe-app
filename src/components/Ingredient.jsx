import { useUnitPreference } from '../context/UnitPreferenceContext';
import { convertUnit } from '../utils/unitConversion';

export default function Ingredient({ amount, unit, name }) {
  const { unitSystem } = useUnitPreference();
  
  const getConvertedAmount = () => {
    // Convert amount to number if it's not already
    const numericAmount = Number(amount);
    
    // If amount is not a valid number, return original values
    if (isNaN(numericAmount)) {
      return { value: amount, unit };
    }
    
    if (unitSystem === 'metric') {
      return { value: numericAmount, unit };
    }
    
    // Convert based on unit type
    switch (unit?.toLowerCase()) {
      case 'kilogram':
        return { value: convertUnit(numericAmount, 'kilogram', 'pound'), unit: 'pound' };
      case 'gram':
        return { value: convertUnit(numericAmount, 'gram', 'ounce'), unit: 'ounce' };
      case 'liter':
        return { value: convertUnit(numericAmount, 'liter', 'cup'), unit: 'cup' };
      case 'ml':
        return { value: convertUnit(numericAmount, 'ml', 'fluid_ounce'), unit: 'fluid ounce' };
      // Don't convert these units
      case 'teaspoon':
      case 'tablespoon':
      case 'pinch':
      case 'piece':
      case 'whole':
      default:
        return { value: numericAmount, unit };
    }
  };
  
  const { value, unit: convertedUnit } = getConvertedAmount();
  
  // Format the value only if it's a number
  const formattedValue = typeof value === 'number' 
    ? Number(value.toFixed(1)).toString()  // Convert to number and back to string to remove trailing zeros
    : value;
  
  const UNIT_DISPLAY = {
    'ml': 'ml',
    'g': 'g',
    'kg': 'kg',
    'cups': 'cups',
    'tablespoons': 'tbsp',
    'teaspoons': 'tsp',
    'fluid ounces': 'fl oz',
    'ounces': 'oz',
    'pounds': 'lbs',
    'pints': 'pt',
    'quarts': 'qt',
    'gallons': 'gal',
    'liters': 'L',
    'kilogram': 'kg',
    'milliliter': 'ml',
    'tablespoon': 'tbsp',
    'teaspoon': 'tsp',
    'pinch': 'pinch',
    'piece': 'pc',
    'whole': 'whole'
  }
  
  return (
    <span>
      {formattedValue}{convertedUnit ? ` ${UNIT_DISPLAY[convertedUnit] || convertedUnit}` : ''} {name}
    </span>
  );
} 