export type UnitSystem = 'metric' | 'imperial';

export interface UnitPreferenceContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
}

export function useUnitPreference(): UnitPreferenceContextType; 