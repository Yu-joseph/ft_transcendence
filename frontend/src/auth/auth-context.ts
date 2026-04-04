import { createContext } from 'react';

export type AuthUser = {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  avatar?: string;
};

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
