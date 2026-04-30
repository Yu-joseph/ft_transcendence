import { useEffect, useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";
// import { chatSocket } from "../../../../socket/sock";
import { useRefresh } from "../../shared/useRefresh";


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
    const   [error, setError] = useState(null);
    const   refresh = useRefresh();

    useEffect(() => {
        const   getPendingRequests = async () => {
            try {
                setError(null);
                setLoading(true);
                const   result: PendingFriendType[] = await fetchClient('/friend/pending', {});
                if(result)
                    setPendingFriend(result);
            } catch (error: any) {
                setError(error);
                console.log('error herer:', error);
            } finally {
                setLoading(false);
            }
        }
        getPendingRequests();
    }, [refresh])

    /**_______ Cancel Friend Logic */
    const   handleCancel = async (reqId: number) => {
        console.log("That is the cancled request:", reqId);
        try {
            const   result = await fetchClient(`/friend/${reqId}/cancel`, { method: 'DELETE' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== reqId));
        } catch (error: any) {
            console.log(error);
        }
    }
    /**_______ Accept Friend Logic */
    const   handleAccept = async (frReqId: number) => {
        try {
            const   result = await fetchClient(`/friend/${frReqId}/accept`, { method: 'PUT' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== frReqId));
        } catch (error : any) {
            console.log(error);
        }
    }
    /**_______ Reject Friend Logic */
    const   handleReject = async (frReqId: number) => {
        try {
            const   result = await fetchClient(`/friend/${frReqId}/reject`, { method: 'PUT' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== frReqId));
        } catch (error : any) {
            console.log(error);
        }
    }
    /**________________________ */
    return {
        handleCancel,
        handleAccept,
        handleReject,
        pendingFriend,
        loading,
        error
    };
}