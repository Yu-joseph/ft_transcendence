import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from './auth-context';

// Cache the fetch promise so multiple component mounts don't cause duplicate requests
let fetchUserPromise: Promise<AuthUser | null> | null = null;

function fetchAuthUser(): Promise<AuthUser | null> {
  // Return cached promise if already in flight
  if (fetchUserPromise) {
    return fetchUserPromise;
  }

  fetchUserPromise = fetch('http://localhost:8080/authent/getuser/', {
    method: 'GET',
    credentials: 'include',
  })
    .then(async (response) => {
      if (!response.ok) {
        // 401 or other error - user is not authenticated
        return null;
      }

      const userData = await response.json();
      return {
        id: String(userData.id ?? userData.user?.id ?? ''),
        username: userData.username ?? userData.user?.username ?? 'Player',
        fullName: userData.fullname ?? userData.fullName ?? userData.user?.fullname,
        email: userData.email ?? userData.user?.email,
        avatar: userData.avatar ?? userData.profile?.avatar,
      };
    })
    .catch(() => {
      // Network error or parsing error
      return null;
    })
    .finally(() => {
      // Clear cache after request completes so next app load can re-fetch
      fetchUserPromise = null;
    });

  return fetchUserPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
