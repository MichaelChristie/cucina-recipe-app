import { createContext, useContext, useState } from 'react';

const UnitPreferenceContext = createContext();

export function UnitPreferenceProvider({ children }) {
  const [unitSystem, setUnitSystem] = useState('metric'); // or 'imperial'
  
  return (
    <UnitPreferenceContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitPreferenceContext.Provider>
  );
}

export function useUnitPreference() {
  return useContext(UnitPreferenceContext);
} 