export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export function logOut(): Promise<void>;
export function signUp(email: string, password: string): Promise<void>; 