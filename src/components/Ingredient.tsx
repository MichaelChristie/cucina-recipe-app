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
      <span className="text-gray-900">
        {amount} {unit}
      </span>
      <span className="text-gray-700">{name}</span>
    </div>
  );
} 