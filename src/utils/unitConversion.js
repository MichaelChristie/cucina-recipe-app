const CONVERSION_RATES = {
  // Weight
  kilogram: {
    pound: 2.20462,
    ounce: 35.274,
    gram: 1000
  },
  gram: {
    pound: 0.00220462,
    ounce: 0.035274,
    kilogram: 0.001
  },
  // Volume
  liter: {
    gallon: 0.264172,
    quart: 1.05669,
    pint: 2.11338,
    cup: 4.22675,
    fluid_ounce: 33.814,
    ml: 1000
  },
  ml: {
    gallon: 0.000264172,
    quart: 0.00105669,
    pint: 0.00211338,
    cup: 0.00422675,
    fluid_ounce: 0.033814,
    liter: 0.001
  },
  // Common cooking measurements
  tablespoon: {
    teaspoon: 3,
    ml: 14.7868
  },
  teaspoon: {
    tablespoon: 0.333333,
    ml: 4.92892
  },
  cup: {
    tablespoon: 16,
    fluid_ounce: 8,
    ml: 236.588
  }
};

const VOLUME_CONVERSIONS = {
  'ml': 1,  // base unit
  'cups': 236.588,
  'tablespoons': 14.7868,
  'teaspoons': 4.92892,
  'fluid ounces': 29.5735,
  'pints': 473.176,
  'quarts': 946.353,
  'gallons': 3785.41,
  'liters': 1000,
}

export function convertUnit(value, fromUnit, toUnit) {
  const normalizedFromUnit = fromUnit.toLowerCase();
  const normalizedToUnit = toUnit.toLowerCase();
  
  if (normalizedFromUnit === normalizedToUnit) return value;
  
  const rate = CONVERSION_RATES[normalizedFromUnit]?.[normalizedToUnit];
  if (!rate) throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
  
  return value * rate;
} 