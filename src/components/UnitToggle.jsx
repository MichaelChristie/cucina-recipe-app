import React from 'react';
import { useUnitPreference } from '../context/UnitPreferenceContext';

export default function UnitToggle() {
  const { unitSystem, toggleUnitSystem } = useUnitPreference();

  return (
    <div className="inline-flex rounded-lg border border-gray-200">
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
          unitSystem === 'metric'
            ? 'bg-tasty-green text-white'
            : 'bg-white text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => unitSystem !== 'metric' && toggleUnitSystem()}
      >
        Metric
      </button>
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
          unitSystem === 'imperial'
            ? 'bg-tasty-green text-white'
            : 'bg-white text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => unitSystem !== 'imperial' && toggleUnitSystem()}
      >
        Imperial
      </button>
    </div>
  );
} 