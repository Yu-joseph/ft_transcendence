import type { AuthUser } from './auth-context';

// Cache the fetch promise so repeated component loads do not cause duplicate requests
let fetchUserPromise: Promise<AuthUser | null> | null = null;

// Fetches the authenticated user from the backend and normalizes the response shape.
// Uses a shared in-flight promise to avoid duplicate network requests.
export function fetchAuthUser(): Promise<AuthUser | null> {
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
    .catch(() => null)
    .finally(() => {
      fetchUserPromise = null;
    });

  return fetchUserPromise;
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
