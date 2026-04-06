import { Edit, Shield, Trophy, UserPlus } from "lucide-react";


interface ProfileHeaderProps {
    isOwnProfile?: boolean
}

export  function ProfileHeader({isOwnProfile = false}: ProfileHeaderProps) {
    const user = {
    name: "mait-taj",
    avatar: "https://avatars.githubusercontent.com/u/1?v=4",
    bio: "Full-Stack Developer | Tic-Tac-Toe Enthusiast | Building awesome things with React and Tailwind CSS.",
    rank: "#12"
  };



    return (
        <div className="bg-slate-800/40 border border-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8
        flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-xl">

            <div className="absolute top-0 right-0 bg-blue-500/10 h-64 w-64 rounded-full blur-3xl -z-10"></div>

            <div className="relative shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-blue-500/30 p-1">
                    <img
                        src="https://avatars.githubusercontent.com/u/1?v=4" 
                        alt="User Avatar" 
                        className="w-full h-full object-cover rounded-full flex items-center justify-center"
                    />
                </div>
                <div className="absolute bottom-2 right-2 bg-green-500 h-5 w-5 rounded-full border-4 border-slate-900 shadow-sm"></div>
            </div>

            <div className="">
                <div className="">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2 md:text-4xl">
                        {user.name}
                        <Shield className="text-blue-400 w-6 h-6"/>
                    </h1>

                    <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400
                    px-3 py-1 rounded-lg shadow[0_0_10px_rgba(249, 115, 22, 0.15)]">
                        <Trophy className="w-4 h-4"/>
                        <span className="font-bold text-sm tracking-wide">Rank {user.rank}</span>
                    </div>
                </div>

                <p className="text-slate-400 mt-3 text-sm max-w-xl mx-auto md:mx-0 leading-relaxed">{user.bio}</p>
            </div>

            <div className="flex flex-col sm:flex-row w-full gap-3 md:w-auto mt-4 md:mt-0 justify-center">
                {isOwnProfile ? (
                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl
                    font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-pointer">
                        <Edit className="w-4 h-4"/>
                        Edit Profile
                    </button>
                ): (
                    // <>
                        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl
                    font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-pointer">
                            <UserPlus className="w-4 h-4"/>
                            Add Friend
                        </button>
  
                )}
            </div>


        </div>
    );
}