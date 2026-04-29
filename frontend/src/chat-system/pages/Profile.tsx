import { useEffect, useState } from "react";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { UserStatCard } from "../components/profile/UserStatCard";
import { SkeletonProfileUi } from "../components/profile/SkeletonProfileUi";
import { ErrorMessage, type TypeOfError } from "../components/shared/ErrorMessage";
import { fetchClient } from "../utils/fetchClient";
import type { UserProfileInfo } from "../components/profile/hooks/useProfileHeader";
import { useAuth } from '../../auth/useAuth';
import { useParams } from "react-router-dom";

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

    useEffect(() => {
        setLoadHeaderInfo(true);
        if(!user?.id || !userId)
            return ;
        const loadUserInfo = async () => {
            setIsOwnProfile(false);
            setErrHeaderInfo(null);
            try {
                console.log("TRhe ID in PARAM:", userId);
                const result = await fetchClient<UserProfileInfo>(`/profile/${userId}`); /** */
                setIsOwnProfile(result.id === user?.id);
                setUserInfo(result)
                console.log("UserInfo result:", result);
            } catch (err:any) {
                console.log('Error in profile header:', err);
                setErrHeaderInfo(err);
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
        <div className="text-white overflow-y-auto h-full w-full bg-slate-950 p-4 md:p-6 lg:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">
                {
                    (loadStat || loadHeaderInfo) && (
                        <SkeletonProfileUi />
                    )
                }
                {
                    !loadStat && !loadHeaderInfo && (statError || errHeaderInfo) && (<ErrorMessage message={statError ?? null} typeOfError={type} /> )
                }
                {
                    !loadStat && !loadHeaderInfo && !statError && !errHeaderInfo && 
                    (
                    <>
                        <ProfileHeader  userGameStat={userStat} isOwnProfile={isOwnProfile}
                                        userInfo={userInfo} setUserInfo={setUserInfo}
                                        />
                        <UserStatCard userGameStat={userStat} isOwnProfile={isOwnProfile} />
                    </>
                    )
                }
            </div>
        </div>
    );
}