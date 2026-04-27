import { useEffect, useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";


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

    /**_____ Hooks _______ */
    useEffect(() => {

        const   getPendingRequests = async () => {
            try {
                setError(null);
                setLoading(true);
                const   result: PendingFriendType[] = await fetchClient('/friend/pending', {});
                setPendingFriend(result);
                console.log("Result pending:", result);
                
            } catch (error: any) {
                setError(error);
                console.log('error herer:', error);
            } finally {
                setLoading(false);
            }
        }
        getPendingRequests();
    }, [])

    /**_______ Cancel Friend Logic */
    const   handleCancel = async (reqId: number) => {
        console.log("That is the cancled request:", reqId);
        try {
            const   result = await fetchClient(`/friend/${reqId}/cancel`, { method: 'DELETE' });
            console.log(result);
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== reqId));
            console.log('Friend request canceled successfully');
        } catch (error: any) {
            console.log(error);
        }
    }
    /**_______ Accept Friend Logic */
    const   handleAccept = async (frReqId: number) => {
        try {
            const   result = await fetchClient(`/friend/${frReqId}/accept`, { method: 'PUT' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== frReqId));
            console.log('request accepted:', result);
        } catch (error : any) {
            console.log(error);
        }
    }
    /**_______ Reject Friend Logic */
    const   handleReject = async (frReqId: number) => {
        try {
            // const   token = await getToken();
            const   result = await fetchClient(`/friend/${frReqId}/reject`, { method: 'PUT' });
            setPendingFriend(prev => prev.filter(fr => fr.friendRequestId !== frReqId));
            console.log('request accepted:', result);
            
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