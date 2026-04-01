import { useEffect, useState } from "react";

interface AuthState {
  isSignedIn: boolean;
  isLoaded: boolean;
}

export type AuthUser = {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
};

type StoredAuthUser = Partial<AuthUser> & {
  fullname?: string;
};

export function getAuthUser(): AuthUser | null {
  // Pull the cached auth payload from localStorage if it exists.
  const rawUser = localStorage.getItem('authUser');
  if (!rawUser) {
    return null;
  }

  try {
    // Parse the stored JSON and normalize field names.
    const parsed = JSON.parse(rawUser) as StoredAuthUser;
    if (!parsed.id) {
      return null;
    }

    return {
      id: String(parsed.id),
      username: parsed.username ?? 'Player',
      fullName: parsed.fullName ?? parsed.fullname,
      email: parsed.email,
    };
  } catch {
    // If parsing fails, treat as unauthenticated.
    return null;
  }
}

export function useCustomAuth(): AuthState {
  // Track whether the user is signed in and whether the check has finished.
  const [state, setState] = useState<AuthState>({
    isSignedIn: false,
    isLoaded: false,
  });

  useEffect(() => {
    // Guard to ignore async results if the component unmounts.
    let isActive = true;

    const checkSession = async () => {
      try {
        // Ask the backend if the session is valid using the auth cookie.
        const response = await fetch("http://localhost:8080/authent/protected/", {
          method: "GET",
          credentials: "include",
        });

        if (!isActive) {
          return;
        }

        setState({
          isSignedIn: response.ok,
          isLoaded: true,
        });
      } catch {
        if (!isActive) {
          return;
        }

        // Network or server error → assume not signed in but mark as loaded.
        setState({
          isSignedIn: false,
          isLoaded: true,
        });
      }
    };

    // Kick off the session check on mount.
    void checkSession();

    return () => {
      // Prevent state updates after unmount.
      isActive = false;
    };
  }, []);

  return state;
}
