import { createContext, useContext, FC, ReactNode, useState } from 'react';

type UnitSystem = 'metric' | 'imperial';

interface UnitPreferenceContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
}

interface UnitPreferenceProviderProps {
  children: ReactNode;
}

const UnitPreferenceContext = createContext<UnitPreferenceContextType | undefined>(undefined);

export const UnitPreferenceProvider: FC<UnitPreferenceProviderProps> = ({ children }) => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  return (
    <UnitPreferenceContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitPreferenceContext.Provider>
  );
};

export const useUnitPreference = () => {
  const context = useContext(UnitPreferenceContext);
  if (context === undefined) {
    throw new Error('useUnitPreference must be used within a UnitPreferenceProvider');
  }
  return context;
}; 