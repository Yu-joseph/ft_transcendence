import { useEffect, useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";
import { useRefresh } from "../../shared/useRefresh";
import { withMediaPrefix } from "../../shared/sharedUtils";

interface BlockedFriendType {
    id: string
    username: string
    avatar: string
}

export  function    useBlockedFriend() {
    const   [loading, setLoading] = useState(false);
    const   [error, setError] = useState(null);
    const   [blocked, setBlocked] = useState<BlockedFriendType[]>([]);
    const   refresh = useRefresh();
    const   [status, setStatus] = useState<{type: 'success' | 'error'; message: string} | null>(null);

    
    useEffect(() => {
        const   getBlockedRequest = async () => {
            try {
                setError(null);
                setLoading(true);
                const result : BlockedFriendType[] = await fetchClient('/friend/rejected', {});
                if(result) {
                    result.map(fr => fr.avatar = withMediaPrefix(fr.avatar) ?? '');
                    setBlocked(result);
                }
            } catch (error: any) {
                setError(error);
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        getBlockedRequest();
    }, [refresh])

    const   handleUnblock = async (receiverName: string) => {
        try {
            setStatus(null);
            const   result = await fetchClient('/friend/request', {
                method: 'POST',
                body: JSON.stringify({username: receiverName})
            });
            setBlocked(prev => prev.filter(u => u.username !== receiverName));
            setStatus({type: 'success', message: 'Friend Unblocked successfuly'});
            console.log(result);
        } catch (error: any) {
            setStatus({type: 'error', message: error?.message ?? 'Failed to add friend'})
            console.log(error);
        }
    }
    /**_________________ */
    return {
        handleUnblock,
        blocked,
        loading,
        error,
        status
    };
}