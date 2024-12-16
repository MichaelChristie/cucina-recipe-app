// Define unit types
type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';
type VolumeUnit = 'ml' | 'l' | 'fl_oz' | 'cup';
type NonConvertibleUnit = 'teaspoon' | 'tablespoon' | 'pinch' | 'piece' | 'whole' | 'clove';
type Unit = WeightUnit | VolumeUnit | NonConvertibleUnit;

// Define conversion mappings type
type UnitMappings = {
  [key: string]: Unit;
};

// Define conversion rates type
type ConversionRates = {
  g_to_oz: number;
  oz_to_g: number;
  g_to_lb: number;
  lb_to_g: number;
};

// Define conversion function type for each unit
type ConversionFunction = (v: number) => number;

// Define conversions object type
type Conversions = {
  [K in WeightUnit | VolumeUnit]?: {
    [T in WeightUnit | VolumeUnit]?: ConversionFunction;
  };
};

declare module '../utils/unitConversion' {
  export const UNIT_MAPPINGS: UnitMappings;
  export const CONVERSION_RATES: ConversionRates;
  
  export function normalizeUnit(unit: string): Unit;
  export function convertUnit(
    amount: number,
    fromUnit: string,
    toUnit: string
  ): number;
} 