import { Calendar, Clock, Edit, Fingerprint, Mail, MessageCircle, Shield, Trophy, UserPlus, UserX, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import  {useAuth}   from    '../../../auth/useAuth';
import { fetchClient } from "../../utils/fetchClient";
import { Navigate, useParams } from "react-router-dom";

type FriendStat = 'accepted' | 'pending' | 'not';

interface UserProfileInfo {
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

interface ProfileHeaderProps {
    isOwnProfile?: boolean
    setIsOwnProfile: React.Dispatch<React.SetStateAction<boolean>>

}

export  function ProfileHeader({isOwnProfile, setIsOwnProfile}: ProfileHeaderProps) {
    const   { user } = useAuth();
    const   params = useParams<string>();
    const   [gotToChat, setGoToChat] = useState<string | null>(null);
    const   [userInfo, setUserInfo] = useState<UserProfileInfo | null>(null);

    useEffect(() => {
        setIsOwnProfile(false);
        console.log("TRhe ID in PARAM:", params.id);
        const   loadUserInfo = async () => {
            try {
                const   userId : string | undefined = params.id;
                console.log("TRhe ID in PARAM:", userId);
                if(!userId)
                    return;
                const   result = await fetchClient<UserProfileInfo>(`/profile/${userId}`);
                result.bio = 'hjfshj fhsdjfhsdjf jbfjsbfjs jbfjsbsdjf jbjfbjbfsd';
                result.fullname = 'Colonel Ondroskotch';
                if(result.id !== user?.id)
                    console.log('it is not my profile');
                setIsOwnProfile(result.id === user?.id);
                setUserInfo(result)
                console.log("UserInfo result:", result);
            } catch (err) {
                console.log('Error in profile header:', err);
            }
        }
        loadUserInfo();
    }, [user, params.id])

    /** *** Botton Click******/
    const   handleAddToFriend = async (username: string) => {
        console.log("In Add button");

        if(!username)
            return;
        try {
            const   option = {
                method: 'POST',
                body: JSON.stringify({receiverId: username})
            };
            const   result = await fetchClient('/friend/request', option);
            console.log("result adding:", result);
            setUserInfo(prev => prev ? ({...prev, isFriend: 'pending'}) : null)
        } catch (error: any) {
            console.log('error is:', error);
        }
    }
    /*___________________________________________________________*/
    const   handleRemoveFriend = async (friendId: string) => {
        console.log("In Remove button");
        if(!userInfo || !friendId)
            return ;
    try {
        const   result = await fetchClient(`/friend/${friendId}`, { method: 'DELETE' });
        setUserInfo(prev => prev ? ({ ...prev, isFriend: 'not' }) : null)
        console.log('Friend Ship removed');
        console.log(result);

    } catch (error: any) {
        console.log(error);
    }
}
/**______________________________________________________________________ */
    const   handleStartConversation = async (userId: string | null) => {
        if(userInfo?.isFriend !== 'accepted') {
            alert('You must be friends to message')
            return;
        }
        if(!userId)
            return;
        try {
            console.log('Starting conversation from profile');
            setGoToChat(null);
            const   result = await fetchClient('/chat/conversations', {
                method: 'POST',
                body: JSON.stringify({friendId: userId})
            });
            console.log("Result of start Conversation:",result);
            console.log('Starting conversation from profile is Done');
            setGoToChat(userId);
        } catch (error:any) {
            console.log('errr:', error);
        } finally {
            // setLoadingConv(true);
        }
    }

    const   friendButtonConfig = {
        not: {
            label: 'Add Friend', icon: <UserPlus className="w-4 h-4"/>, classname: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-transparent', disabled: false,
            onClick: () => handleAddToFriend(userInfo?.username as string)
        },
        pending: {
            label: 'Pending...', icon: <Clock className="w-4 h-4" />, classname: 'bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-not-allowed opacity-60', disabled: true,
            onClick: () => {}
        },
        accepted: {
            label: 'Unfreind', icon: <UserX size={20} />, classname: 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-transparent', disabled: false,
            onClick: () => handleRemoveFriend(userInfo?.id as string)
        }
    }
    const   currentFriendButtonConf = friendButtonConfig[userInfo?.isFriend ?? 'not'];
    const   joinedDate: string = userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('en-US', {month: 'long', year: 'numeric'}) : 'Recently'

    if(gotToChat)
        return <Navigate state={{selectedFriendId: gotToChat}} to={'/Chat'} />

    return (
        <div className="bg-slate-800/40 border border-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8
        flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-xl">

            <div className="absolute top-0 right-0 bg-blue-500/10 h-64 w-64 rounded-full blur-3xl -z-10"></div>

            <div className="relative shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-blue-500/30 p-1">
                    <img
                        src={`${userInfo?.avatar}`} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover rounded-full flex items-center justify-center"
                    />
                </div>
                <div className="absolute bottom-2 right-2 bg-green-500 h-5 w-5 rounded-full border-4 border-slate-900 shadow-sm"></div>
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2 md:text-4xl">
                        {userInfo?.username}
                        <Shield className="text-blue-400 w-6 h-6"/>
                    </h1>
                    <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400
                    px-3 py-1 rounded-lg shadow[0_0_10px_rgba(249, 115, 22, 0.15)]">
                        <Trophy className="w-4 h-4"/>
                        <span className="font-bold text-sm tracking-wide">Rank {12}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-slate-300">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/5 rounded-full backdrop-blur-sm">
                            <Fingerprint className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium">{userInfo?.fullname ?? 'Anonymous User'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                            <Mail className="w-4 h-4 text-purple-400" />
                            {userInfo?.email}
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                            <Calendar className="text-emerald-400 w-4 h-4"/>
                            {joinedDate}
                        </div>
                    </div>
                </div>

                <p className="text-slate-400 mt-3 text-sm max-w-xl mx-auto md:mx-0 leading-relaxed">{userInfo?.bio ?? 'Unknown'}</p>
            </div>

            <div className="flex flex-col sm:flex-row w-full gap-3 md:w-auto mt-4 md:mt-0 justify-center">
                {isOwnProfile ? (
                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl
                    font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-pointer">
                        <Edit className="w-4 h-4"/>
                        Edit Profile
                    </button>
                ): (
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button
                            onClick={() => handleStartConversation(userInfo?.isFriend === 'accepted' ? userInfo?.id : null)}
                            disabled={userInfo?.isFriend === 'accepted' ? false : true}
                            title={userInfo?.isFriend !== 'accepted' ? 'You must be friends to send a message' : ''}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white
                                px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-indigo-500/30 cursor-pointer
                                disabled:cursor-not-allowed disabled:opacity-50">
                                <MessageCircle className="w-4 h-4" />
                                Message 
                        </button>
                        <button
                            onClick={currentFriendButtonConf.onClick}
                            disabled={currentFriendButtonConf.disabled}
                            className=
                                {`flex-1 flex items-center justify-center gap-2 ${currentFriendButtonConf.classname}
                                 px-5 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-md cursor-pointer`
                                }
                        >
                        { currentFriendButtonConf.icon }
                        { currentFriendButtonConf.label }
                        {/* // !userInfo?.isFriend ? (<><UserPlus className="w-4 h-4"/>Add Friend</>) : (<><UserX size={20} />Unfriend</>) */}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}