import { useState } from "react";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { UserStatCard } from "../components/profile/UserStatCard";

export  function Profile() {
    const   [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);

    return (
        <div className="text-white overflow-y-auto h-full w-full bg-slate-950 p-4 md:p-6 lg:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">
                <ProfileHeader isOwnProfile={isOwnProfile} setIsOwnProfile={setIsOwnProfile} />
                <UserStatCard />
            </div>
        </div>
    );
}