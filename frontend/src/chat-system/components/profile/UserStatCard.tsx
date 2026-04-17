import type { UserStatGame } from "../../pages/Profile";

interface UserStatCardProps {
    isOwnProfile: boolean
    userGameStat: UserStatGame | null
}

export function UserStatCard({ userGameStat, isOwnProfile }: UserStatCardProps) {

    const totalGames = (userGameStat?.losses) ?? 0 + (userGameStat?.wins ?? 0);
    const winRate = totalGames > 0 ? Math.round(((userGameStat?.wins ?? 1) / totalGames) * 100) : 0;
    console.log('User Stat', userGameStat);
    return (
        <div className="bg-[#111A3A]/80 border border-[#2A3A6B] rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden w-full">
            <div className="absolute bottom-0 right-0 bg-emerald-500/5 h-64 w-64 rounded-full  -z-10"></div>
            <h1 className="text-orange-400 text-xl font-bold mb-1 md:text-2xl">{isOwnProfile ? 'You Progress' : 'Arena Progress'}</h1>
            <p className="text-slate-400 text-sm mb-8">Match statictics</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 grid-colse gap-4 md:gap-8 mb-8">
                <div className="bg-[#1A2542] rounded-xl p-6 md:p-8 flex flex-col items-center justify-center border border-emerald-500/10
                hover:border-emerald-500/30 transition-colors shadow-inner">
                    <span className="text-emerald-400 text-5xl font-black mb-2 md:text-6xl drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">{userGameStat?.wins}</span>
                    <span className="text-slate-400 text-xs md:text-sm font-bold tracking-[0.2em]">WINS</span>
                </div>

                <div className="bg-[#1A2542] rounded-xl p-6 md:p-8 flex flex-col items-center justify-center border border-rose-500/10
                hover:border-rose-500/30 transition-colors shadow-inner">
                    <span className="text-rose-400 text-5xl font-black mb-2 md:text-6xl drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        {userGameStat?.losses}</span>
                    <span className="text-slate-400 text-xs md:text-sm font-bold tracking-[0.2em]">LOSSES</span>
                </div>
                <div className="bg-[#1A2542] rounded-xl p-6 md:p-8 flex flex-col items-center justify-center border border-rose-500/10
                hover:border-rose-500/30 transition-colors shadow-inner">
                    <span className="text-rose-400 text-5xl font-black mb-2 md:text-6xl drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        {userGameStat?.tournamentWins}</span>
                    <span className="text-slate-400 text-xs md:text-sm font-bold tracking-[0.2em]">Tour Wins</span>
                </div>
                <div className="bg-[#1A2542] rounded-xl p-6 md:p-8 flex flex-col items-center justify-center border border-rose-500/10
                hover:border-rose-500/30 transition-colors shadow-inner">
                    <span className="text-rose-400 text-5xl font-black mb-2 md:text-6xl drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        {userGameStat?.tournamentJoined}</span>
                    <span className="text-slate-400 text-xs md:text-sm font-bold tracking-[0.2em]">Tour Joined</span>
                </div>
            </div>
            <div className="bg-[#1A2542]/50 p-5 rounded-xl border border-[#2A3A6B]/50">
                <div className="flex justify-between items-end mb-3">
                    <span className="text-slate-300 text-sm font-medium">Win Rate</span>
                    <span className="text-emerald-400 font-bold text-xl tracking-widest">{winRate}%</span>
                </div>
                <div className="h-4 w-full bg-[#2A3A6B] rounded-full overflow-hidden shadow-inner flex">
                    <div
                        className="bg-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${winRate}%` }}
                    ></div>
                </div>
                <p className="text-slate-400 text-xs text-right mt-3">{totalGames} total games played</p>
            </div>

        </div>
    );
}