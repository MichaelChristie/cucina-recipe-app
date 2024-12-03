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
  ml: {
    fluid_ounce: 0.033814,
    cup: 0.00422675,
    pint: 0.00211338,
    quart: 0.00105669,
    gallon: 0.000264172,
    liter: 0.001
  },
  liter: {
    fluid_ounce: 33.814,
    cup: 4.22675,
    pint: 2.11338,
    quart: 1.05669,
    gallon: 0.264172,
    ml: 1000
  },
  fluid_ounce: {
    ml: 29.5735,
    liter: 0.0295735
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

const UNIT_SYSTEMS = {
  metric: {
    weight: ['gram', 'kilogram', 'kg', 'g'],
    volume: ['ml', 'milliliter', 'millilitre', 'liter', 'l', 'mL', 'ML', 'milliliters'],
  },
  imperial: {
    weight: ['pound', 'ounce', 'lb', 'oz'],
    volume: ['gallon', 'quart', 'pint', 'cup', 'fluid_ounce', 'fl_oz', 'fluid ounce', 'fluid_oz'],
  },
  neutral: {
    other: ['tablespoon', 'teaspoon', 'tbsp', 'tsp', 'pinch', 'dash'],
  }
};

const UNIT_ALIASES = {
  'kg': 'kilogram',
  'g': 'gram',
  'lb': 'pound',
  'oz': 'ounce',
  'tbsp': 'tablespoon',
  'tsp': 'teaspoon',
  'fl_oz': 'fluid_ounce',
  'l': 'liter',
  'ml': 'ml',
  'mL': 'ml',
  'ML': 'ml',
  'milliliter': 'ml',
  'millilitre': 'ml',
  'milliliters': 'ml',
  'fluid ounce': 'fluid_ounce',
  'fluid oz': 'fluid_ounce',
  'fl oz': 'fluid_ounce',
  'fl_oz': 'fluid_ounce',
};

export function convertUnit(value, fromUnit, toSystem) {
  if (!fromUnit) return value;  // Early return if no unit provided
  
  // console.log('Starting conversion:', { value, fromUnit, toSystem, fromUnitType: typeof fromUnit });
  
  const normalizedFromUnit = UNIT_ALIASES[fromUnit.toLowerCase()] || fromUnit.toLowerCase();
  // console.log('Normalized unit:', normalizedFromUnit);
  
  // Find which system and type the unit belongs to
  let fromSystem, unitType;
  for (const [system, categories] of Object.entries(UNIT_SYSTEMS)) {
    for (const [type, units] of Object.entries(categories)) {
      if (units.includes(normalizedFromUnit)) {
        fromSystem = system;
        unitType = type;
        break;
      }
    }
    if (fromSystem) break;
  }
  
  // console.log('Detected:', { fromSystem, unitType });

  // If unit is neutral or systems match, return original value
  if (fromSystem === 'neutral' || fromSystem === toSystem) {
    // console.log('No conversion needed:', { fromSystem, toSystem });
    return value;
  }

  // Determine target unit based on unit type
  let toUnit;
  if (unitType === 'weight') {
    toUnit = toSystem === 'metric' ? 'kilogram' : 'pound';
  } else if (unitType === 'volume') {
    toUnit = toSystem === 'metric' ? 'ml' : 'fluid_ounce';
  }

  // console.log('Converting to:', { toUnit });

  if (!toUnit) {
    // console.log('No target unit found');
    return value;
  }

  const rate = CONVERSION_RATES[normalizedFromUnit]?.[toUnit];
  if (!rate) {
    // console.log('No conversion rate found for:', { normalizedFromUnit, toUnit });
    throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
  }
  
  const result = value * rate;
  // console.log('Conversion result:', { value, rate, result });
  
  return result;
} 