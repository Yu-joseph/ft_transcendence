import  { useEffect, useState } from "react";
import  { fetchClient } from "../../../utils/fetchClient";
import  type { AuthUser } from "../../../../auth/auth-context";
import { chatSocket } from "../../../../socket/sock";

type FriendStat = 'accepted' | 'pending' | 'not';

export interface UserProfileInfo {
    id: string
    username: string
    email: string
    fullname: string
    created_at: Date
    avatar: string | null
    user_status: string
    bio?: string
    rank?: number
    isFriend: FriendStat
}

interface UseUserProfileProps {
    user: AuthUser | null
    setUserInfo: React.Dispatch<React.SetStateAction<UserProfileInfo|null>>
    userInfo: UserProfileInfo | null
}


export function useProfileHeader({user, setUserInfo, userInfo } : UseUserProfileProps) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [gotToChat, setGoToChat] = useState<string | null>(null);

    useEffect(() => {

        const   handleFriendUpdate = (data: {senderName: string, type: string}) => {
            if (userInfo?.username === data.senderName) {
                
                if (data.type === 'ACCEPT') {
                    // They accepted our request
                    setUserInfo(prev => prev ? { ...prev, isFriend: 'accepted' } : null);
                    
                } else if (data.type === 'REMOVE' || data.type === 'REJECT' || data.type === 'CANCEL') {
                    // The friendship or request was destroyed
                    setUserInfo(prev => prev ? { ...prev, isFriend: 'not' } : null);
                    
                } else if (data.type === 'REQUEST') {
                    // They just sent us a friend request while we are looking at their profile!
                    setUserInfo(prev => prev ? { ...prev, isFriend: 'pending' } : null);
                }
            }
        };
        
        chatSocket.on('notification:friend_update', handleFriendUpdate);

        return () => {
            chatSocket.off('notification:friend_update', handleFriendUpdate);
        };
    }, [userInfo?.username, setUserInfo])
    
    /** *** Botton Click******/
    const handleAddToFriend = async (username: string) => {
        console.log("In Add button");

        if (!username || !user)
            return;
        try {
            const option = {
                method: 'POST',
                body: JSON.stringify({ username: username })
            };
            const result = await fetchClient('/friend/request', option);
            setUserInfo(prev => prev ? ({ ...prev, isFriend: 'pending' }) : null)
        } catch (err) {
            console.log('error is:', err);
        }
    }
/**_______________________________________________________________________ */
    const handleRemoveFriend = async (friendId: string) => {
        console.log("In Remove button");
        if (!userInfo || !friendId)
            return;
        try {
            const result = await fetchClient(`/friend/${friendId}`, { method: 'DELETE' });
            setUserInfo(prev => prev ? ({ ...prev, isFriend: 'not' }) : null)
            console.log('Friend Ship removed');
            console.log(result);

        } catch (error) {
            console.log(error);
        }
    }
/**_____________________________________________________________________________ */
    const handleStartConversation = async (userId: string | null) => {
        if (userInfo?.isFriend !== 'accepted') {
            alert('You must be friends to message')
            return;
        }
        if (!userId || !user?.id)
            return;
        try {
            console.log('Starting conversation from profile');
            setGoToChat(null);
            const result = await fetchClient('/chat/conversations', {
                method: 'POST',
                body: JSON.stringify({ friendId: userId })
            });
            console.log("Result of start Conversation:", result);
            console.log('Starting conversation from profile is Done');
            setGoToChat(userId);
        } catch (error) {
            console.log('errr:', error);
        }
    }
/**_________________________________________________________________________________ */
    const handleSaveProfile = async (updatedData: any) => {
        console.log('This is the Updated Info:', updatedData);
        try {
            console.log('Handle Save profile data:', updatedData);
            const   {avatar, ...dataToSend} = updatedData;
            const   result = await fetch('/authent/update_users/', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend)
            });
            if (!result.ok) {
                throw new Error('Error updating information');
            }
            // console.log('Result of the updated:', result);
            console.log("Prev user info:", userInfo);
            if(updatedData.email.trim() === '')
                updatedData.email = userInfo?.email;
            if(updatedData.fullname.trim() === '')
                updatedData.fullname = userInfo?.fullname;
            if(updatedData.bio.trim() === '')
                updatedData.bio = userInfo?.bio;

            console.log('AVATAR URL IN HANDLESAVE PROFILE:', avatar);

            setUserInfo(prev => prev ? { ...prev, ...updatedData } : null);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    }
/**__________________________________________________________________________________ */

    return {
        handleAddToFriend,
        handleRemoveFriend,
        handleStartConversation,
        handleSaveProfile,
        gotToChat,
        isEditing,
        setIsEditing
    };
}