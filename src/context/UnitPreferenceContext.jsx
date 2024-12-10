import React, { createContext, useContext, useState } from 'react';

const UnitPreferenceContext = createContext();

export function UnitPreferenceProvider({ children }) {
  const [unitSystem, setUnitSystem] = useState('metric'); // Default to metric

  const toggleUnitSystem = () => {
    setUnitSystem(current => current === 'metric' ? 'imperial' : 'metric');
  };

  return (
    <UnitPreferenceContext.Provider value={{ unitSystem, toggleUnitSystem }}>
      {children}
    </UnitPreferenceContext.Provider>
  );
}

export function useUnitPreference() {
  const context = useContext(UnitPreferenceContext);
  if (!context) {
    throw new Error('useUnitPreference must be used within a UnitPreferenceProvider');
  }
  return context;
} 