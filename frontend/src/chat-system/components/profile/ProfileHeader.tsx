import { Calendar, Clock, Edit, Fingerprint, Mail, MessageCircle, UserPlus, UserX } from "lucide-react";
import { useAuth } from '../../../auth/useAuth';
import { Navigate } from "react-router-dom";
import { EditProfileModal } from "./EditProfileModal";
import { useProfileHeader, type UserProfileInfo } from "./hooks/useProfileHeader";
import type React from "react";

interface ProfileHeaderProps {
    // userGameStat: UserStatGame | null
    isOwnProfile?: boolean
    setUserInfo: React.Dispatch<React.SetStateAction<UserProfileInfo|null>>
    userInfo: UserProfileInfo | null
}

export function ProfileHeader({ isOwnProfile, userInfo, setUserInfo }: ProfileHeaderProps) {
    const { user } = useAuth();

    const {
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
        } = useProfileHeader({user: user, setUserInfo: setUserInfo, userInfo: userInfo});

    const friendButtonConfig = {
        not: {
            label: 'Add Friend', icon: <UserPlus className="w-4 h-4" />, classname: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-transparent', disabled: false,
            onClick: () => handleAddToFriend(userInfo?.username as string)
        },
        pending: {
            label: 'Pending...', icon: <Clock className="w-4 h-4" />, classname: 'bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-not-allowed opacity-60', disabled: true,
            onClick: () => { }
        },
        accepted: {
            label: 'Unfreind', icon: <UserX size={20} />, classname: 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-transparent', disabled: false,
            onClick: () => handleRemoveFriend(userInfo?.id as string)
        }
    }
    const currentFriendButtonConf = friendButtonConfig[userInfo?.isFriend ?? 'not'];
    const joinedDate: string = userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'
    /**_____________________ Component-Style _____________________ */
    if (gotToChat)
        return <Navigate state={{ selectedFriendId: gotToChat }} to={'/Chat'} />

    return (
        <section className="relative group">
            {/* Decorative background glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-blue-600 rounded-4xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-slate-900/60 border border-white/10 backdrop-blur-2xl rounded-4xl p-6 md:p-10
                flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 overflow-hidden shadow-2xl">
                
                {/* Profile Picture Section */}
                <div className="relative shrink-0">
                    <div className="relative group/avatar">
                        <div className="absolute -inset-1.5 bg-linear-to-tr from-indigo-500 via-purple-500 to-blue-500 rounded-full blur opacity-40 group-hover/avatar:opacity-70 transition duration-900 animate-spin"></div>
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-2xl">
                            <img
                                src={`${userInfo?.avatar}`}
                                alt={userInfo?.username || 'Avatar'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                            />
                        </div>
                        {/* Status Indicator (hidden on own profile) */}
                        {!isOwnProfile && (
                            <div className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-slate-900 shadow-xl
                                ${userInfo?.user_status === 'Online' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-500 shadow-slate-500/50'}`}>
                                <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${userInfo?.user_status === 'Online' ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
                    <div className="space-y-3 w-full">

                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                            {userInfo?.username}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[13px] font-medium backdrop-blur-sm transition-colors hover:bg-white/10">
                                <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                                {userInfo?.fullname || 'Anonymous'}
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[13px] font-medium backdrop-blur-sm transition-colors hover:bg-white/10">
                                <Mail className="w-3.5 h-3.5 text-purple-400" />
                                {userInfo?.email}
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[13px] font-medium backdrop-blur-sm transition-colors hover:bg-white/10">
                                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                                Joined {joinedDate}
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-xl">
                        <p className="text-slate-400 text-sm md:text-[15px] leading-relaxed font-medium">
                            {userInfo?.bio || 'No bio provided yet. This user prefers to keep a mysterious profile.'}
                        </p>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-2">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-200 
                                px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-white/10 active:scale-95"
                            >
                                <Edit size={18} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <button
                                    onClick={() => handleStartConversation(userInfo?.isFriend === 'accepted' ? userInfo?.id : null)}
                                    disabled={userInfo?.isFriend !== 'accepted'}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white
                                        px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-indigo-500/20 
                                        disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <MessageCircle size={18} />
                                    Send Message
                                </button>
                                <button
                                    onClick={currentFriendButtonConf.onClick}
                                    disabled={currentFriendButtonConf.disabled}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold 
                                        transition-all duration-300 backdrop-blur-md active:scale-95 shadow-xl ${currentFriendButtonConf.classname}`}
                                >
                                    {currentFriendButtonConf.icon}
                                    {currentFriendButtonConf.label}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <EditProfileModal
                    isOpen={isEditing} 
                    onClose={() => setIsEditing(false)} 
                    initialData={userInfo}
                    onHandleSaveInfo={handleSaveProfile}
                    serverError={serverError}
                    setServerError={setServerError}
                    isSavingProfile={isSaving}
                />
            </div>
        </section>
    );
}