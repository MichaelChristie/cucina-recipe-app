import { useUnitPreference } from '../context/UnitPreferenceContext';

export default function UnitToggle() {
  const { unitSystem, setUnitSystem } = useUnitPreference();
  
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
      <button
        onClick={() => setUnitSystem('metric')}
        className={`px-4 py-1.5 text-sm rounded-md transition-colors duration-200
          ${unitSystem === 'metric' 
            ? 'bg-tasty-green text-white' 
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        Metric
      </button>
      <button
        onClick={() => setUnitSystem('imperial')}
        className={`px-4 py-1.5 text-sm rounded-md transition-colors duration-200
          ${unitSystem === 'imperial' 
            ? 'bg-tasty-green text-white' 
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        Imperial
      </button>
    </div>
  );
} 