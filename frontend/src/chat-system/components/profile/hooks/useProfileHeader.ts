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
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false); 

    useEffect(() => {

        /**________ friend update event ___________________ */
        const   handleFriendUpdate = (data: {senderName: string, type: string}) => {
            if (userInfo?.username === data.senderName) {
                
                if (data.type === 'ACCEPT') {
                    setUserInfo(prev => prev ? { ...prev, isFriend: 'accepted' } : null);
                    
                } else if (data.type === 'REMOVE' || data.type === 'REJECT' || data.type === 'CANCEL') {
                    setUserInfo(prev => prev ? { ...prev, isFriend: 'not' } : null);
                    
                } else if (data.type === 'REQUEST') {
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
    const handleSaveProfile = async (updatedData: any, isUserInfoChanged: boolean) => {
        setServerError(null);
        setIsSaving(true); // Disable buttons while saving
        try {
            if(isUserInfoChanged) { // we only run the fetch if the user info changed

                const   {avatar, ...dataToSend} = updatedData;
                const   result = await fetch('/authent/update_users/', {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataToSend)
                });
                if (result.status === 401) {
                    window.location.href = '/'; // Redirect to login when session expired
                    return;
                }
                if (!result.ok) {
                    const contentType = result.headers.get("content-type");
                    let errorMessage = 'Error updating information';

                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await result.json();
                        errorMessage = errorData?.error || errorMessage;
                    } else {
                        // this means its html error from backend
                        errorMessage = `Server Error (${result.status}): The server returned an invalid response.`;
                    }
                    throw new Error(errorMessage || 'Error updating information');
                }
            }
            /**__________________________________ */
            if(updatedData.email.trim() === '')
                updatedData.email = userInfo?.email;
            if(updatedData.fullname.trim() === '')
                updatedData.fullname = userInfo?.fullname;
            if(updatedData.bio.trim() === '')
                updatedData.bio = userInfo?.bio;
            // Update UI State with updatedData (handles both info and new avatar url)
            setUserInfo(prev => prev ? { ...prev, ...updatedData } : null);
            setIsEditing(false);
        } catch (error: any) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                setServerError("Network error: Please check your internet connection.");
            } else {
                setServerError(error.message || 'Failed to save profile');
            }
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false); //reenable button
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
        setIsEditing,
        serverError,
        setServerError,
        isSaving
    };
}