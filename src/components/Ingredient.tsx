import { FC } from 'react';
import { useUnitPreference } from '../context/UnitPreferenceContext';
import { convertUnit } from '../utils/unitConversion';

interface IngredientProps {
  amount: number;
  unit: string;
  name: string;
  defaultUnit?: string;
}

export default function Ingredient({ amount, unit, name, defaultUnit }: IngredientProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">
        {amount} {unit || defaultUnit}
      </span>
      <span>{name}</span>
    </div>
  );
} 