import type { AuthUser } from './auth-context';

// Cache the fetch promise so repeated component loads do not cause duplicate requests
let fetchUserPromise: Promise<AuthUser | null> | null = null;

export function fetchAuthUser(): Promise<AuthUser | null> {
  if (fetchUserPromise) {
    return fetchUserPromise;
  }

  fetchUserPromise = (async () => {
    try {
      // First check if user is authorized using protected endpoint
      const protectedResponse = await fetch('/authent/protected/', {
        method: 'GET',
        credentials: 'include',
      });

      const protectedData = await protectedResponse.json();

      // If not authorized, return null
      if (protectedData.message !== 'Authorized') {
        return null;
      }

      // If authorized, fetch full user data
      const response = await fetch('/authent/getuser/', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
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
    } catch {
      return null;
    }
  })();

  return fetchUserPromise;
}

// Fetches user from the protected endpoint
export async function fetchProtectedUser(): Promise<{ authorized: boolean; userId?: string }> {
  try {
    const response = await fetch('/authent/protected/', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.message === 'Authorized') {
      return { authorized: true, userId: String(data.user_id) };
    }

    return { authorized: false };
  } catch {
    return { authorized: false };
  }
}


// Internal ref to allow handleUnauthorized to reach into the provider.
let setUserGlobal: (user: AuthUser | null) => void = () => {};

// Expose the setter for use in the provider.
export function exposeSetUser(fn: (user: AuthUser | null) => void) {
  setUserGlobal = fn;
}

// Clear the setter on unmount.
export function clearSetUser() {
  setUserGlobal = () => {};
}

// Call this from anywhere (e.g. an API utility) when any fetch returns 401.
// It clears the user immediately without needing to poll.
export function handleUnauthorized() {
  setUserGlobal(null);
}