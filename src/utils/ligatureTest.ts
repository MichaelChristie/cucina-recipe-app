// Function to test various operators and ligatures
const testLigatures = () => {
  // Comparison operators
  const isEqual = (a: number, b: number): boolean => a === b;
  const isNotEqual = (a: number, b: number): boolean => a !== b;
  const isGreaterEqual = (a: number, b: number): boolean => a >= b;
  const isLessEqual = (a: number, b: number): boolean => a <= b;

  // Arrow functions with different operators
  const multiply = (a: number) => a *= 2;
  const divide = (a: number) => a /= 2;
  const power = (x: number) => x ** 2;

  // Logical operators
  const hasPermission = true && false;
  const defaultValue = "default";
  const someValue: string | null = null;
  const isAvailable = someValue ?? defaultValue;
  const canAccess = false || true;

  // Assignment operators with arrows
  const numbers = [1, 2, 3].map((x) => x + 1)
    .filter((x) => x >= 2)
    .reduce((acc, val) => acc += val, 0);

  // Bitwise operators
  const bitwiseAnd = 0b1100 & 0b1010;
  const bitwiseOr = 0b1100 | 0b1010;
  const bitwiseXor = 0b1100 ^ 0b1010;

  // Function that may return null
  const maybeNull = (): number | null => {
    return Math.random() > 0.5 ? Math.floor(Math.random() * 100) : null;
  };

  return {
    isEqual,
    isNotEqual,
    isGreaterEqual,
    isLessEqual,
    numbers,
    bitwiseAnd,
    bitwiseOr,
    bitwiseXor,
    isAvailable,
    maybeNull
  };
};

export default testLigatures; 