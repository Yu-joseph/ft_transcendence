import { useEffect, useState } from "react";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { UserStatCard } from "../components/profile/UserStatCard";

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
    const [userId, setUserId] = useState<string | null>(null);
    const [userStat, setUserStat] = useState<UserStatGame | null>(null);

    useEffect(() => {
        if (!userId)
            return;

        const loadUserStatGame = async () => {
            try {
                const result = await fetch(`http://${window.location.hostname}:1339/api/users/${userId}/status`, {
                    'credentials': 'include'
                });
                if (!result.ok)
                    throw new Error('Failed to load User stats');
                const data = await result.json() as UserStatGame;
                console.log("Result of the game statistic:", data);
                setUserStat(data);
            } catch (err) {
                console.log('error:', err);
            }
        }
        loadUserStatGame();
    }, [userId])

    return (

        <div className="text-white overflow-y-auto h-full w-full bg-slate-950 p-4 md:p-6 lg:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">
                <ProfileHeader userGameStat={userStat} isOwnProfile={isOwnProfile} setIsOwnProfile={setIsOwnProfile} setUserId={setUserId} />
                <UserStatCard userGameStat={userStat} isOwnProfile={isOwnProfile} />
            </div>
        </div>
    );
}