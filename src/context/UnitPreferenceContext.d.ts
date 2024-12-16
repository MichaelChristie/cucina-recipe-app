declare module '../context/UnitPreferenceContext' {
  export type UnitSystem = 'metric' | 'imperial';
  
  interface UnitPreferenceContextType {
    unitSystem: UnitSystem;
    setUnitSystem: (system: UnitSystem) => void;
  }

  export function useUnitPreference(): UnitPreferenceContextType;
} 