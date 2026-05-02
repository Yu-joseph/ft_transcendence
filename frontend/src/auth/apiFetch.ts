// src/api/apiFetch.ts
import { handleUnauthorized } from './auth-utils';

async function apiFetch(url: string, options?: RequestInit): Promise<Response | null> {
  let res = await fetch(url, { credentials: 'include', ...options });

  if (res.status === 401) {
    // Silently try to refresh
    const refreshed = await fetch('/authent/refresh/', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshed.ok) {
      // Retry original request with new token
      res = await fetch(url, { credentials: 'include', ...options });
    } else {
      // Refresh also expired → log out
      handleUnauthorized();
      return null;
    }
  }

  return res;
}

export default apiFetch;