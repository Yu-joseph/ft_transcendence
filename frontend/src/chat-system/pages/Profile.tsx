import { useEffect, useState } from "react";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { UserStatCard } from "../components/profile/UserStatCard";
import { SkeletonProfileUi } from "../components/profile/SkeletonProfileUi";
import { ErrorMessage, type TypeOfError } from "../components/shared/ErrorMessage";
import { fetchClient } from "../utils/fetchClient";
import type { UserProfileInfo } from "../components/profile/hooks/useProfileHeader";
import { useAuth } from '../../auth/useAuth';
import { useParams } from "react-router-dom";
import { withMediaPrefix } from "../components/shared/sharedUtils";
import { chatSocket } from "../../socket/sock";

export interface UserStatGame {
    rank: number
    xp: number
    wins: number
    losses: number
    tournamentWins: number
    tournamentJoined: string
    status: string
}

export function Profile() {
    const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserProfileInfo | null>(null);
    const { user } = useAuth();
    const params = useParams<string>();
    const userId = params.id as string | null;
    
    const [userStat, setUserStat] = useState<UserStatGame | null>(null);
    const [loadStat, setLoadStat] = useState<boolean>(false);
    const [statError, setStatError] = useState<string | null>(null);
    const [loadHeaderInfo, setLoadHeaderInfo] = useState<boolean>(false);// this for load header info in 'ProfileHeader' component
    const [errHeaderInfo, setErrHeaderInfo] = useState<string|null>(null);// this for load header info in 'ProfileHeader' component


        // Listen for status updates and update userInfo when it matches
    useEffect(() => {
        const onStatusUpdate = (data: { userId: string, status: string }) => {
            if (!data || !data.userId)
                return;
            if (userInfo?.id && data.userId === userInfo.id) {
                setUserInfo(prev => prev ? { ...prev, user_status: data.status } : prev);
            }
        };

        chatSocket.on('status:update', onStatusUpdate);
        return () => { chatSocket.off('status:update', onStatusUpdate); };
    }, [userInfo?.id, setUserInfo]);

    useEffect(() => {
        if(!user?.id || !userId)
            return ;
        const loadUserInfo = async () => {
            setLoadHeaderInfo(true);
            setIsOwnProfile(false);
            setErrHeaderInfo(null);
            try {
                const result = await fetchClient<UserProfileInfo>(`/profile/${userId}`); /** */
                if(result) {
                    setIsOwnProfile(result.id === user?.id);
                    result.avatar = withMediaPrefix(result.avatar) ?? '';
                    setUserInfo(result)
                }
            } catch (err:any) {
                console.log('Error in profile header:', err);
                setErrHeaderInfo(err?.message || 'Failed to load profile');
            } finally {
                setLoadHeaderInfo(false);
            }
        }
        loadUserInfo();
        /**____________________________________________________________________ */
        const loadUserStatGame = async () => {
            setLoadStat(true);
            if(!userId)
                return;
            try {
                setStatError(null);
                const result = await fetch(`https://${window.location.hostname}:8443/game-api/api/users/${userId}/status`, {
                    'credentials': 'include'
                });
                if (!result.ok)
                    throw new Error('Failed to load User stats');
                const data = await result.json() as UserStatGame;
                console.log("Result of the game statistic:", data);
                setUserStat(data);
            } catch (err: any) {
                console.log('error:', err.message);
                setStatError(err.message);
            } finally {
                setLoadStat(false);
            }
        }
        loadUserStatGame();
    }, [userId, user?.id])

    const   type: TypeOfError = 'profile information';
    return (
        <main className="relative h-full w-full bg-slate-950 overflow-y-auto overflow-x-hidden no-scrollbar">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="relative z-10 p-4 md:p-8 lg:p-12 pb-24 lg:pb-32">
                <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
                    {
                        (loadStat || loadHeaderInfo) && (
                            <SkeletonProfileUi />
                        )
                    }
                    {
                        !loadStat && !loadHeaderInfo && (statError || errHeaderInfo) && (
                            <div className="flex justify-center py-12">
                                <ErrorMessage message={statError ?? errHeaderInfo ?? null} typeOfError={type} />
                            </div>
                        )
                    }
                    {
                        !loadStat && !loadHeaderInfo && !statError && !errHeaderInfo && (
                            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <ProfileHeader 
                                    userGameStat={userStat} 
                                    isOwnProfile={isOwnProfile}
                                    userInfo={userInfo} 
                                    setUserInfo={setUserInfo}
                                />
                                <UserStatCard 
                                    userGameStat={userStat} 
                                    isOwnProfile={isOwnProfile} 
                                />
                            </div>
                        )
                    }
                </div>
            </div>
        </main>
    );
}