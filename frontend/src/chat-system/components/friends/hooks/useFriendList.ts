import { useEffect, useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";
import { useAuth } from "../../../../auth/useAuth";
import { useRefresh } from "../../shared/useRefresh";
import { chatSocket } from "../../../../socket/sock";

export interface FriendsListType {
    id: string
    username: string
    user_status: string
    avatar: string
    created_at: Date
}

type ActiveTabeType = 'All' | 'Online' | 'Offline';

export  function    useFriendList() {
    const   [friendList, setFriendList] = useState<FriendsListType[]>([]);
    const   [error, setError] = useState(null);
    const   [loading, setLoading] = useState(false);
    const   [activeTab, setActivetab] = useState<ActiveTabeType>('All');
    const   [goChat, setGoChat] = useState<string | null>(null);
    const   refresh = useRefresh();
    const   {user} = useAuth();

    /******************************* */

    useEffect(() => {
        const   onStatusUpdate = (data: {userId: string, status: string}) => {
            setFriendList(prev => prev.map(f => 
                f.id === data.userId ? {...f, user_status: data.status} : f
            ));
        }
        chatSocket.on('status:update', onStatusUpdate);
        return () => { chatSocket.off('status:update', onStatusUpdate); }
    }, [])

    useEffect(() => {
        const   fetchUserList = async () => {
            try {
                setError(null);
                setLoading(true);
                const   result  = await fetchClient<FriendsListType[]>('/friend', {});
                setFriendList(result);
                console.log("Friend list:", friendList);
            } catch (err: any) {
                setError(err);
                console.log(err);
            }
            finally{
                setLoading(false);
            }
        }
        fetchUserList();
    }, [user, refresh])
    
    /************************************** */
    const   handleRemoveFriend = async (friendId: string) => {
        if(!friendId)
            return;
        try {
            const   result = await fetchClient(`/friend/${friendId}`, { method: 'DELETE' });
            setFriendList(prev => prev.filter(fr => fr.id !== friendId));
            console.log(result);
            // Broadcast to the rest of the app specialy for my chat.tsx that a friend was removed!
            window.dispatchEvent(new Event("refresh_friends"));
        } catch (error: any) {
            console.log(error);
        }
    }
/**-------------------------------------------------------- */
    const   handleStartConversation = async (userId: string) => {
        if(!userId)
            return;
        try {
            setGoChat(null);
            const   result = await fetchClient('/chat/conversations', {
                method: 'POST',
                body: JSON.stringify({friendId: userId})
            });
            console.log("Result of start Conversation:",result);
            setGoChat(userId);

        } catch (error:any) {
            console.log('errr:', error);
        } finally {
            // setLoadingConv(true);
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
        error
        
    };
}