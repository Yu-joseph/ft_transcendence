import { useEffect, useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";
import { useAuth } from "../../../../auth/useAuth";
// import  { useAuth 
export interface FriendsListType {
    id: string
    username: string
    status: string
    avatar: string
    // created_at: Date
}

type ActiveTabeType = 'All' | 'Online' | 'Offline';

export  function    useFriendList() {
    const   [friendList, setFriendList] = useState<FriendsListType[]>([]);
    const   [error, setError] = useState(null);
    const   [loading, setLoading] = useState(false);
    const   [activeTab, setActivetab] = useState<ActiveTabeType>('All');
    // const   [loadingConv, setLoadingConv] = useState(false);
    const   [goChat, setGoChat] = useState<string | null>(null);

    const   {user} = useAuth();

    useEffect(() => {
        const   fetchUserList = async () => {
            try {
                setError(null);
                setLoading(false);
                const   result  = await fetchClient<FriendsListType[]>('/friend', {});
                setFriendList(result);
                console.log("Friend list:", friendList);
            } catch (err: any) {
                setError(err);
                console.log(err);
            }
            finally{
                setLoading(true);
            }
        }
        fetchUserList();
    }, [user])
    
    /************************************** */
    const   handleRemoveFriend = async (friendId: string) => {
        if(!friendId)
            return;
        try {
            const   result = await fetchClient(`/friend/${friendId}`, { method: 'DELETE' });
            setFriendList(prev => prev.filter(fr => fr.id !== friendId));
            console.log(result);

        } catch (error: any) {
            console.log(error);
        }
    }
/**-------------------------------------------------------- */
    const   handleStartConversation = async (userId: string) => {
        if(!userId)
            return;
        try {
            console.log('::::');
            setLoadingConv(false);
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
            setLoadingConv(true);
        }
    }

    const fiteredFriend = friendList.filter((friend) => {
        if (activeTab === 'All') return true;
        return activeTab === friend.status;
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