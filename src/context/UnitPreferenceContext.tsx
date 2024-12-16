import { createContext, useContext, FC, useState } from 'react';
import type { ReactNode } from 'react';

type UnitSystem = 'metric' | 'imperial';

interface UnitPreferenceContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  toggleUnitSystem: () => void;
}

interface UnitPreferenceProviderProps {
  children: ReactNode;
}

const UnitPreferenceContext = createContext<UnitPreferenceContextType | undefined>(undefined);

const UnitPreferenceProvider: FC<UnitPreferenceProviderProps> = ({ children }) => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  const toggleUnitSystem = () => {
    setUnitSystem(current => current === 'metric' ? 'imperial' : 'metric');
  };

  return (
    <UnitPreferenceContext.Provider value={{ unitSystem, setUnitSystem, toggleUnitSystem }}>
      {children}
    </UnitPreferenceContext.Provider>
  );
};

const useUnitPreference = () => {
  const context = useContext(UnitPreferenceContext);
  if (context === undefined) {
    throw new Error('useUnitPreference must be used within a UnitPreferenceProvider');
  }
  return context;
};

export { UnitPreferenceContext, UnitPreferenceProvider, useUnitPreference };
export type { UnitSystem, UnitPreferenceContextType }; 