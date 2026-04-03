import { useContext } from 'react';
import { AuthContext } from './auth-context';

// Returns auth context values and ensures this hook is used inside AuthProvider.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
