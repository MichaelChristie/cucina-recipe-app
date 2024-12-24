import { Switch } from '@headlessui/react';
import { useUnitPreference } from '../context/UnitPreferenceContext';

export default function UnitToggle() {
  const { unitSystem, toggleUnitSystem } = useUnitPreference();
  const isMetric = unitSystem === 'metric';

  return (
    <Switch.Group>
      <div className="flex items-center">
        <Switch
          checked={isMetric}
          onChange={toggleUnitSystem}
          className={`${
            isMetric ? 'bg-tasty-green' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
          <span
            className={`${
              isMetric ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
        <Switch.Label className="ml-2 text-sm text-gray-600">
          {isMetric ? 'Metric' : 'Imperial'}
        </Switch.Label>
      </div>
    </Switch.Group>
  );
} 