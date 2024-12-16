import { FC } from 'react';
import { useUnitPreference } from '../context/UnitPreferenceContext';
import { convertUnit } from '../utils/unitConversion';

interface IngredientProps {
  amount: number;
  unit: string;
  name: string;
  defaultUnit: string;
}

const Ingredient: FC<IngredientProps> = ({ amount, unit, name, defaultUnit }) => {
  const { unitSystem } = useUnitPreference();

  const nonConvertibleUnits: string[] = ['whole', 'piece', 'clove', 'pinch', 'teaspoon', 'tablespoon'];

  const displayAmount = (): string => {
    if (!amount) return '';
    
    if (nonConvertibleUnits.includes(unit)) {
      return amount.toString();
    }

    const numericAmount = parseFloat(amount.toString());

    try {
      if (unit === 'gram' || unit === 'g') {
        if (unitSystem === 'metric') {
          return numericAmount >= 1000 ? 
            (numericAmount / 1000).toFixed(1) : 
            numericAmount.toString();
        } else {
          const inOunces = convertUnit(numericAmount, 'g', 'oz');
          return inOunces >= 16 ? 
            (inOunces / 16).toFixed(1) : 
            inOunces.toFixed(1);
        }
      }

      if (unit === 'ounce' || unit === 'oz') {
        if (unitSystem === 'imperial') {
          return numericAmount >= 16 ? 
            (numericAmount / 16).toFixed(1) : 
            numericAmount.toString();
        } else {
          const inGrams = convertUnit(numericAmount, 'oz', 'g');
          return inGrams >= 1000 ? 
            (inGrams / 1000).toFixed(1) : 
            inGrams.toFixed(0);
        }
      }

      const baseUnit = unitSystem === 'metric' ? 'g' : 'oz';
      const converted = convertUnit(numericAmount, unit, baseUnit);
      
      return unitSystem === 'metric'
        ? converted >= 1000 
          ? (converted / 1000).toFixed(1) 
          : converted.toFixed(0)
        : converted >= 16 
          ? (converted / 16).toFixed(1) 
          : converted.toFixed(1);
    } catch (error) {
      console.warn(`Conversion error for ${name}:`, error);
      return amount.toString();
    }
  };

  const displayUnit = (): string => {
    if (nonConvertibleUnits.includes(unit)) {
      return unit;
    }

    if (unitSystem === 'metric') {
      const amount = parseFloat(displayAmount());
      return amount >= 1000 ? 'kg' : 'g';
    } else {
      const amount = parseFloat(displayAmount());
      return amount >= 16 ? 'lb' : 'oz';
    }
  };

  return (
    <span>
      {displayAmount()} {displayUnit()} {name}
    </span>
  );
};

export default Ingredient; 