const   BASE_URL = import.meta.env.VITE_CHAT_API ?? 'http://localhost:3000';

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

    const   data = await response.json();
    if(!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
    }
    return data.data;
}