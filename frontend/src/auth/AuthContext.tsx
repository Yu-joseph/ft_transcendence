import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from './auth-context';

// Cache the fetch promise so repeated component loads do not cause duplicate requests
let fetchUserPromise: Promise<AuthUser | null> | null = null;

// Fetches the authenticated user from the backend and normalizes the response shape.
// Uses a shared in-flight promise to avoid duplicate network requests.
function fetchAuthUser(): Promise<AuthUser | null> {
  // Return cached promise if already in flight
  if (fetchUserPromise) {
    return fetchUserPromise;
  }

  fetchUserPromise = fetch('/authent/getuser/', {
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

// Provides auth state to the app and initializes user data once when it first loads.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent state updates if this provider closes before fetch completes.
    let isActive = true;

    // Loads current session user and flips loading off when finished.
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
