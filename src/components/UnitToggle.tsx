import { useUnitPreference } from '../context/UnitPreferenceContext';

export default function UnitToggle() {
  const { unitSystem, toggleUnitSystem } = useUnitPreference();

  return (
    <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-0.5">
      <button
        onClick={() => unitSystem !== 'imperial' && toggleUnitSystem()}
        className={`px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
          unitSystem === 'imperial'
            ? 'bg-tasty-green text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Imperial
      </button>
      <button
        onClick={() => unitSystem !== 'metric' && toggleUnitSystem()}
        className={`px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
          unitSystem === 'metric'
            ? 'bg-tasty-green text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Metric
      </button>
    </div>
  );
} 