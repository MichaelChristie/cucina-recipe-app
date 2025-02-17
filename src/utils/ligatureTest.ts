// Function to test various operators and ligatures
const testLigatures = () => {
  // Comparison operators
  const isEqual = 42 === 42;
  const isNotEqual = 10 !== 5;
  const isGreaterEqual = 100 >= 50;
  const isLessEqual = 20 <= 30;

  // Arrow functions with different operators
  const multiply = (a: number) => a *= 2;
  const divide = (a: number) => a /= 2;
  const power = (x: number) => x ** 2;

  // Logical operators
  const hasPermission = true && false;
  const isAvailable = null ?? "default";
  const canAccess = false || true;

  // Assignment operators with arrows
  const numbers = [1, 2, 3].map((x) => x + 1)
    .filter((x) => x >= 2)
    .reduce((acc, val) => acc += val, 0);

  // Bitwise operators
  const bitwiseAnd = 0b1100 & 0b1010;
  const bitwiseOr = 0b1100 | 0b1010;
  const bitwiseXor = 0b1100 ^ 0b1010;

  // Walrus operator simulation (even though TS doesn't have it)
  let result;
  if ((result = someFunction()) !== null) {
    // do something
  }

  // Fat arrow with async
  const fetchData = async (): Promise<void> => {
    const response = await fetch("https://api.example.com");
    if (response?.ok) {
      const data = await response.json();
      console.log(data);
    }
  };

  // Optional chaining and nullish coalescing
  const userSettings = {
    theme: {
      darkMode: true
    }
  };
  
  const isDarkMode = userSettings?.theme?.darkMode ?? false;

  // Type assertions and generics
  type Maybe<T> = T | null;
  const getValue = <T>(val: Maybe<T>): T => val !== null ? val : {} as T;

  return {
    isEqual,
    isNotEqual,
    isGreaterEqual,
    isLessEqual,
    numbers,
    bitwiseAnd,
    bitwiseOr,
    bitwiseXor,
    isDarkMode,
  };
};

// Helper function for the example
function someFunction(): number | null {
  return Math.random() > 0.5 ? 42 : null;
} 