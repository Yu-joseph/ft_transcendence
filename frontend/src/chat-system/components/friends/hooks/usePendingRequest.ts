import { useEffect, useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";
import { useRefresh } from "../../shared/useRefresh";
import { withMediaPrefix } from "../../shared/sharedUtils";
import { getErrorMessage } from "../../../utils/error";


type RequestType = 'incoming' | 'outgoing';

interface PendingFriendType {
    friendRequestId: number
    status: string
    userInfo: {
        id: string
        username: string
        avatar: string | null
    }
    type: RequestType
}

export  function    usePendingRequest() {
    const   [pendingFriend, setPendingFriend] = useState<PendingFriendType[]>([]);
    const   [loading, setLoading] = useState(false);
    const   refresh = useRefresh();
    const [error, setError] = useState<string | null>(null); // page load
    const [actionError, setActionError] = useState<string | null>(null); // accept/reject/cancel

    useEffect(() => {
        const   getPendingRequests = async () => {
            try {
                setError(null);
                setActionError(null);
                setLoading(true);
                const   result: PendingFriendType[] = await fetchClient('/friend/pending', {});
                if(result) {
                    result.map(fr => {
                        fr.userInfo.avatar = withMediaPrefix(fr.userInfo.avatar) ?? '';
                    });
                    setPendingFriend(result);
                }
            } catch (err: unknown) {
                setPendingFriend([]);
                setError(getErrorMessage(err, "Could not load pending requests."));
            } finally {
                setLoading(false);
            }
        }
        getPendingRequests();
    }, [refresh])

    /**_______ Cancel Friend Logic */
    const   handleCancel = async (reqId: number) => {
        try {
            setActionError(null);
            await fetchClient(`/friend/${reqId}/cancel`, { method: 'DELETE' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== reqId));
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Could not cancel request."));
        }
    }
    /**_______ Accept Friend Logic */
    const   handleAccept = async (frReqId: number) => {
        try {
            setActionError(null);
            await fetchClient(`/friend/${frReqId}/accept`, { method: 'PUT' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== frReqId));
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Could not accept request."));
        }
    }
    /**_______ Reject Friend Logic */
    const   handleReject = async (frReqId: number) => {
        try {
            setActionError(null);
            await fetchClient(`/friend/${frReqId}/reject`, { method: 'PUT' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== frReqId));
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Could not reject request."));
        }
    }
    /**________________________ */
    return {
        handleCancel,
        handleAccept,
        handleReject,
        pendingFriend,
        loading,
        error,
        actionError,
        clearActionError: () => setActionError(null),
    };
}