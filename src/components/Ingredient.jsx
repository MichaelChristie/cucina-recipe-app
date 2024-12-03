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
    
    // Normalize the unit before checking
    const normalizedUnit = unit?.toLowerCase()?.trim();
    // console.log('Processing ingredient:', { amount: numericAmount, unit: normalizedUnit, unitSystem });
    
    // Convert based on unit type
    switch (normalizedUnit) {
      case 'kilogram':
      case 'kg':
        return { 
          value: convertUnit(numericAmount, 'kilogram', unitSystem), 
          unit: unitSystem === 'metric' ? 'kilogram' : 'pound' 
        };
      case 'gram':
      case 'g':
        return { 
          value: convertUnit(numericAmount, 'gram', unitSystem), 
          unit: unitSystem === 'metric' ? 'gram' : 'ounce' 
        };
      case 'liter':
      case 'l':
        return { 
          value: convertUnit(numericAmount, 'liter', unitSystem), 
          unit: unitSystem === 'metric' ? 'liter' : 'cup' 
        };
      case 'ml':
      case 'milliliter':
      case 'millilitre':
      case 'mL':
        return { 
          value: convertUnit(numericAmount, 'ml', unitSystem), 
          unit: unitSystem === 'metric' ? 'ml' : 'fluid ounce' 
        };
      // Don't convert these units
      case 'teaspoon':
      case 'tablespoon':
      case 'pinch':
      case 'piece':
      case 'whole':
      default:
        // console.log('No conversion needed for unit:', normalizedUnit);
        return { value: numericAmount, unit };
    }
  };
  
  const { value, unit: convertedUnit } = getConvertedAmount();
  
  // Format the value only if it's a number
  const formattedValue = typeof value === 'number' 
    ? Number(value.toFixed(1)).toString()
    : value;
  
  console.log('Final conversion result:', { value: formattedValue, unit: convertedUnit });
  
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