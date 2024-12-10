import React from 'react';
import { useUnitPreference } from '../context/UnitPreferenceContext';
import { convertUnit } from '../utils/unitConversion';

export default function Ingredient({ amount, unit, name, defaultUnit }) {
  const { unitSystem } = useUnitPreference();

  const nonConvertibleUnits = ['whole', 'piece', 'clove', 'pinch', 'teaspoon', 'tablespoon'];

  const displayAmount = () => {
    if (!amount) return '';
    
    // Don't convert special units
    if (nonConvertibleUnits.includes(unit)) {
      return amount;
    }

    const numericAmount = parseFloat(amount);

    try {
      // Handle metric measurements
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

      // Handle imperial measurements
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

      // Handle other conversions
      const baseUnit = unitSystem === 'metric' ? 'g' : 'oz';
      const converted = convertUnit(numericAmount, unit, baseUnit);
      
      if (unitSystem === 'metric') {
        return converted >= 1000 ? 
          (converted / 1000).toFixed(1) : 
          converted.toFixed(0);
      } else {
        return converted >= 16 ? 
          (converted / 16).toFixed(1) : 
          converted.toFixed(1);
      }
    } catch (error) {
      console.warn(`Conversion error for ${name}:`, error);
      return amount;
    }
  };

  const displayUnit = () => {
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
} 