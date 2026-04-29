const   BASE_URL = import.meta.env.VITE_CHAT_API ?? 'https://localhost:8443/api';

export async function    fetchClient<T>(endpoint: string, option: RequestInit = {}) : Promise<T> {
    const   headers = {
        'Content-Type': 'application/json',
        ...(option.headers as Record<string, string> || {})
    }
    const   response = await fetch(`${BASE_URL}${endpoint}`, {
        ...option,
        headers,
        credentials: 'include'
    });

    let   data: any;
    try {
        data = await response.json();
    } catch (e) {
        data = {message: 'Server unreachable. Try again later...'};
    }

    if (response.status === 401) {
        console.warn("Session expired. Redirecting to login...");
        window.location.href = '/'; // redirect to login page when token expired
        return Promise.reject(new Error("Unauthorized"));
    }

    if(!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
    }
    if (!data || data.data === undefined) {
        throw new Error(data?.message || "Invalid server response structure");
    }
    return data.data;
}