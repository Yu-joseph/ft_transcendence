import { useEffect, useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";
import { useAuth } from "../../../../auth/useAuth";
import { useRefresh } from "../../shared/useRefresh";
import { chatSocket } from "../../../../socket/sock";
import { withMediaPrefix } from "../../shared/sharedUtils";
import { getErrorMessage } from "../../../utils/error";

export interface FriendsListType {
    id: string
    username: string
    user_status: string
    avatar: string
    created_at: Date
}

type ActiveTabeType = 'All' | 'Online' | 'Offline';

export  function    useFriendList() {
    
    const   {user} = useAuth();
    const   refresh = useRefresh();
    const   [friendList, setFriendList] = useState<FriendsListType[]>([]);
    const   [loading, setLoading] = useState(false);
    const   [activeTab, setActivetab] = useState<ActiveTabeType>('All');
    const   [goChat, setGoChat] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); // page level error
    const [actionError, setActionError] = useState<string | null>(null); // button/action error
    /******************************* */

    useEffect(() => {
        const   onStatusUpdate = (data: {userId: string, status: string}) => {
            setFriendList(prev => prev.map(f => 
                f.id === data.userId ? {...f, user_status: data.status} : f
            ));
        }
        chatSocket.on('status:update', onStatusUpdate);
        return () => { chatSocket.off('status:update', onStatusUpdate); }
    }, [user?.id])
    /***________________________________________________________________ */
    useEffect(() => {
        const   fetchUserList = async () => {
            try {
                setError(null);
                setActionError(null);
                setLoading(true);
                const   result  = await fetchClient<FriendsListType[]>('/friend', {});
                if(result) {
                    result.map(fr => fr.avatar = withMediaPrefix(fr.avatar || null) ?? '')
                    setFriendList(result ?? []);
                }
            } catch (err: unknown) {
                setFriendList([]);
                setError(getErrorMessage(err, "Could not load friends list."));
            }
            finally{
                setLoading(false);
            }
        }
        fetchUserList();
    }, [user?.id, refresh])
    
    /************************************** */
    const   handleRemoveFriend = async (friendId: string) => {
        if(!friendId)
            return;
        try {
            setActionError(null);
            await fetchClient(`/friend/${friendId}`, { method: 'DELETE' });
            setFriendList(prev => prev.filter(fr => fr.id !== friendId));
            // Broadcast to the rest of the app specialy for my chat.tsx that a friend was removed!
            window.dispatchEvent(new Event("refresh_friends"));
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Could not remove friend."));
        }
    }
/**-------------------------------------------------------- */
    const   handleStartConversation = async (userId: string) => {
        if(!userId)
            return;
        try {
            setActionError(null);
            setGoChat(null);
            await fetchClient('/chat/conversations', {
                method: 'POST',
                body: JSON.stringify({friendId: userId})
            });
            setGoChat(userId);
        } catch (err:unknown) {
            setActionError(getErrorMessage(err, "Could not start conversation."));
        }
    }

    const fiteredFriend = friendList.filter((friend) => {
        if (activeTab === 'All') return true;
        return activeTab === friend.user_status;
    });

    /**__________________ */
    return {
        handleRemoveFriend,
        handleStartConversation,
        setActivetab,
        goChat,
        activeTab,
        fiteredFriend,
        loading,
        error,
        actionError,
        clearActionError: () => setActionError(null),
    };
}