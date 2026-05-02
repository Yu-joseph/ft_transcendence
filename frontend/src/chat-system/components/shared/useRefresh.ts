import { useEffect, useState } from "react";
export function useRefresh() {
    const [refresh, setRefresh] = useState(0);
    
    useEffect(() => {
        const handler = () => setRefresh(prev => prev + 1);
        window.addEventListener('refresh_friends', handler);
        return () => window.removeEventListener('refresh_friends', handler);
    }, []);
    return refresh;
}