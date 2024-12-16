export interface User {
  email: string | null;
  // Add other user properties as needed
}

export interface AuthContextType {
  user: User | null;
  // Add other auth context properties as needed
} 