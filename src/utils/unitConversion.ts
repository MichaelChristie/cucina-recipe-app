const metricToImperial = {
  g: { unit: 'oz', factor: 0.035274 },
  kg: { unit: 'lb', factor: 2.20462 },
  ml: { unit: 'fl oz', factor: 0.033814 },
  l: { unit: 'qt', factor: 1.05669 },
  cm: { unit: 'in', factor: 0.393701 },
  m: { unit: 'ft', factor: 3.28084 },
};

const imperialToMetric = {
  oz: { unit: 'g', factor: 28.3495 },
  lb: { unit: 'kg', factor: 0.453592 },
  'fl oz': { unit: 'ml', factor: 29.5735 },
  qt: { unit: 'l', factor: 0.946353 },
  in: { unit: 'cm', factor: 2.54 },
  ft: { unit: 'm', factor: 0.3048 },
};

export const convertUnit = (amount: number, fromUnit: string, toUnit: string): number => {
  if (fromUnit === toUnit) return amount;

  // Convert from metric to imperial
  if (fromUnit in metricToImperial) {
    const conversion = metricToImperial[fromUnit as keyof typeof metricToImperial];
    if (conversion.unit === toUnit) {
      return amount * conversion.factor;
    }
  }

  // Convert from imperial to metric
  if (fromUnit in imperialToMetric) {
    const conversion = imperialToMetric[fromUnit as keyof typeof imperialToMetric];
    if (conversion.unit === toUnit) {
      return amount * conversion.factor;
    }
  }

  // If no conversion found, return original amount
  return amount;
}; 