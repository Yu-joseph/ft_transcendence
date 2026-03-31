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
  const rawUser = localStorage.getItem('authUser');
  if (!rawUser) {
    return null;
  }

  try {
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
    return null;
  }
}

export function useCustomAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isSignedIn: false,
    isLoaded: false,
  });

  useEffect(() => {
    let isActive = true;

    const checkSession = async () => {
      try {
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

        setState({
          isSignedIn: false,
          isLoaded: true,
        });
      }
    };

    void checkSession();

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
