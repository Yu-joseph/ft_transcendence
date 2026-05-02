import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from './auth-context';
import { fetchAuthUser, exposeSetUser, clearSetUser } from './auth-utils';

// Provides auth state to the app and initializes user data once when it first loads.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Expose setUser globally so handleUnauthorized() can clear it from outside React.
  useEffect(() => {
    exposeSetUser(setUser);
    return () => {
      clearSetUser();
    };
  }, [setUser]);

  // Initialize auth state once on mount.
  useEffect(() => {
    let isActive = true;

    const initializeAuth = async () => {
      const userData = await fetchAuthUser();
      if (isActive) {
        setUser(userData);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isActive = false;
    };
  }, []);

  // Revalidate session on tab focus/visibility change (no polling).
  useEffect(() => {
    let isActive = true;

    const refreshAuthUser = async () => {
      const userData = await fetchAuthUser();
      if (isActive) {
        setUser(userData);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAuthUser();
      }
    };

    window.addEventListener('focus', refreshAuthUser);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      window.removeEventListener('focus', refreshAuthUser);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Sync logout across browser tabs via localStorage event.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'auth:logout') return;
      setUser(null);
      setLoading(false);
      sessionStorage.removeItem('activeTournament');
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}