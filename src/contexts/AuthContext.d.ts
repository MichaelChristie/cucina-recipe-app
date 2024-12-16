import { User } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthContextType; 