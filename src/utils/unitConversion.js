// Add consistent unit normalization
const UNIT_MAPPINGS = {
  // Weight
  'gram': 'g',
  'grams': 'g',
  'g': 'g',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'kg': 'kg',
  'ounce': 'oz',
  'ounces': 'oz',
  'oz': 'oz',
  'pound': 'lb',
  'pounds': 'lb',
  'lb': 'lb',
  // Volume
  'milliliter': 'ml',
  'milliliters': 'ml',
  'ml': 'ml',
  'liter': 'l',
  'liters': 'l',
  'l': 'l',
  'fluid_ounce': 'fl_oz',
  'fluid ounce': 'fl_oz',
  'fluid_ounces': 'fl_oz',
  'fluid ounces': 'fl_oz',
  // Keep original for non-convertible
  'teaspoon': 'teaspoon',
  'tablespoon': 'tablespoon',
  'pinch': 'pinch',
  'piece': 'piece',
  'whole': 'whole',
  'clove': 'clove'
};

// Update the conversion rates to be more precise
const CONVERSION_RATES = {
  g_to_oz: 0.035274,
  oz_to_g: 28.3495,
  g_to_lb: 0.00220462,
  lb_to_g: 453.592
};

export function convertUnit(amount, fromUnit, toUnit) {
  // Normalize units
  fromUnit = normalizeUnit(fromUnit);
  toUnit = normalizeUnit(toUnit);

  // If units are the same, return original amount
  if (fromUnit === toUnit) return amount;

  // Define conversion rates
  const conversions = {
    // Weight
    g: {
      kg: (v) => v / 1000,
      oz: (v) => v * 0.035274,
      lb: (v) => v * 0.00220462
    },
    kg: {
      g: (v) => v * 1000,
      oz: (v) => v * 35.274,
      lb: (v) => v * 2.20462
    },
    oz: {
      g: (v) => v * 28.3495,
      kg: (v) => v * 0.0283495,
      lb: (v) => v / 16
    },
    lb: {
      g: (v) => v * 453.592,
      kg: (v) => v * 0.453592,
      oz: (v) => v * 16
    },
    // Volume
    ml: {
      l: (v) => v / 1000,
      'fl_oz': (v) => v * 0.033814,
      cup: (v) => v * 0.00422675
    },
    l: {
      ml: (v) => v * 1000,
      'fl_oz': (v) => v * 33.814,
      cup: (v) => v * 4.22675
    },
    'fl_oz': {
      ml: (v) => v * 29.5735,
      l: (v) => v * 0.0295735,
      cup: (v) => v / 8
    },
    cup: {
      ml: (v) => v * 236.588,
      l: (v) => v * 0.236588,
      'fl_oz': (v) => v * 8
    }
  };

  // Helper to normalize unit names
  function normalizeUnit(unit) {
    if (!unit) return '';
    unit = unit.toLowerCase().trim();
    const unitMap = {
      'gram': 'g',
      'grams': 'g',
      'g': 'g',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'kg': 'kg',
      'ounce': 'oz',
      'ounces': 'oz',
      'oz': 'oz',
      'pound': 'lb',
      'pounds': 'lb',
      'lb': 'lb',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'ml': 'ml',
      'liter': 'l',
      'liters': 'l',
      'l': 'l',
      'fluid_ounce': 'fl_oz',
      'fluid_ounces': 'fl_oz',
      'fluid ounce': 'fl_oz',
      'fluid ounces': 'fl_oz'
    };
    return unitMap[unit] || unit;
  }

  // If no conversion needed or possible, return original amount
  if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
    return amount;
  }

  // Perform conversion and round to 2 decimal places
  const converted = conversions[fromUnit][toUnit](parseFloat(amount));
  return Math.round(converted * 100) / 100;
} 