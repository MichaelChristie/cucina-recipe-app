import { Switch } from '@headlessui/react';
import { useUnitPreference } from '../context/UnitPreferenceContext';

export default function UnitToggle() {
  const { unitSystem, toggleUnitSystem } = useUnitPreference();

  return (
    <Switch
      checked={unitSystem === 'metric'}
      onChange={toggleUnitSystem}
      className={`${
        unitSystem === 'metric' ? 'bg-tasty-green' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tasty-green/20`}
    >
      <span className="sr-only">Toggle unit system</span>
      <span
        className={`${
          unitSystem === 'metric' ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </Switch>
  );
} 