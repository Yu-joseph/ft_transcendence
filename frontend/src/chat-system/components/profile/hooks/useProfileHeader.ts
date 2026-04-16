import  { useEffect, useState } from "react";
import  { fetchClient } from "../../../utils/fetchClient";
import  type { AuthUser } from "../../../../auth/auth-context";

type FriendStat = 'accepted' | 'pending' | 'not';

export interface UserProfileInfo {
    id: string
    username: string
    email: string
    fullname: string
    created_at: Date
    avatar: string | null
    status: string
    bio?: string
    rank?: number
    isFriend: FriendStat
}

interface UseUserProfileProps {
    userId: string | null
    user: AuthUser | null
    setIsOwnProfile: React.Dispatch<React.SetStateAction<boolean>>
}

export function useProfileHeader({userId, user, setIsOwnProfile} : UseUserProfileProps) {
    const [userInfo, setUserInfo] = useState<UserProfileInfo | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [gotToChat, setGoToChat] = useState<string | null>(null);

    useEffect(() => {
        if(!userId || !user?.id)
            return ;
        setIsOwnProfile(false);
        console.log("TRhe ID in PARAM:", userId);
        const loadUserInfo = async () => {
            try {
                console.log("TRhe ID in PARAM:", userId);
                const result = await fetchClient<UserProfileInfo>(`/profile/${userId}`); /** */
                setIsOwnProfile(result.id === user?.id);
                setUserInfo(result)
                console.log("UserInfo result:", result);
            } catch (err) {
                console.log('Error in profile header:', err);
            }
        }
        loadUserInfo();
    }, [user, userId])

    /** *** Botton Click******/
    const handleAddToFriend = async (username: string) => {
        console.log("In Add button");

        if (!username)
            return;
        try {
            const option = {
                method: 'POST',
                body: JSON.stringify({ receiverId: username })
            };
            const result = await fetchClient('/friend/request', option);
            console.log("result adding:", result);
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
            if(updatedData.bio !== '' && updatedData.bio.length > 50) {
                console.log('Bio is Too long');
                return ;
            }
            const   result = await fetch('/authent/update_users/', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData)
            });
            if (!result.ok) {
                throw new Error('Error updating information');
            }
            console.log('Result of the updated:', result);
            console.log("Prev user info:", userInfo);
            if(updatedData.email.trim() === '')
                updatedData.email = userInfo?.email;
            if(updatedData.fullname.trim() === '')
                updatedData.fullname = userInfo?.fullname;
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
        userInfo,
        setIsEditing
    };
}