import { createContext, useContext, FC, ReactNode, useState } from 'react';

interface UnitPreferenceContextType {
  unit: string;
  setUnit: (unit: string) => void;
}

const UnitPreferenceContext = createContext<UnitPreferenceContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const UnitPreferenceProvider: FC<Props> = ({ children }) => {
  const [unit, setUnit] = useState('metric');

  return (
    <UnitPreferenceContext.Provider value={{ unit, setUnit }}>
      {children}
    </UnitPreferenceContext.Provider>
  );
};

export const useUnitPreference = (): UnitPreferenceContextType => {
  const context = useContext(UnitPreferenceContext);
  if (context === undefined) {
    throw new Error('useUnitPreference must be used within a UnitPreferenceProvider');
  }
  return context;
}; 