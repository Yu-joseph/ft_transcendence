import type { UserStatGame } from "../../pages/Profile";

interface UserStatCardProps {
    isOwnProfile: boolean
    userGameStat: UserStatGame | null
}

export function UserStatCard({ userGameStat, isOwnProfile }: UserStatCardProps) {

    const totalGames = (userGameStat?.losses) ?? 0 + (userGameStat?.wins ?? 0);
    const winRate = totalGames > 0 ? Math.round(((userGameStat?.wins ?? 1) / totalGames) * 100) : 0;
    return (
        <div className="relative group/stats overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -z-10"></div>
            
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-6 md:p-10 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-amber-500 text-sm font-bold tracking-[0.2em] uppercase mb-2">
                            {isOwnProfile ? 'Performance Tracking' : 'Arena Analytics'}
                        </h2>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Match Statistics
                        </h1>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mr-2">Win Rate:</span>
                        <span className="text-emerald-400 font-black text-xl tracking-tight">{winRate}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Wins Card */}
                    <div className="relative group/card bg-slate-800/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-500 hover:border-emerald-500/30 hover:bg-slate-800/60 hover:-translate-y-1 shadow-inner">
                        <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <span className="text-emerald-400 text-6xl md:text-7xl font-black mb-2 transition-transform duration-500 group-hover/card:scale-110 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                            {userGameStat?.wins || 0}
                        </span>
                        <span className="text-slate-500 text-[11px] font-black tracking-[0.3em] uppercase">Total Victories</span>
                    </div>

                    {/* Losses Card */}
                    <div className="relative group/card bg-slate-800/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-500 hover:border-rose-500/30 hover:bg-slate-800/60 hover:-translate-y-1 shadow-inner">
                        <div className="absolute top-4 right-4 w-12 h-12 bg-rose-500/10 rounded-full blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <span className="text-rose-500 text-6xl md:text-7xl font-black mb-2 transition-transform duration-500 group-hover/card:scale-110 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                            {userGameStat?.losses || 0}
                        </span>
                        <span className="text-slate-500 text-[11px] font-black tracking-[0.3em] uppercase">Defeats</span>
                    </div>

                    {/* Tournaments Card */}
                    <div className="relative group/card bg-slate-800/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-500 hover:border-amber-500/30 hover:bg-slate-800/60 hover:-translate-y-1 shadow-inner sm:col-span-2 lg:col-span-1">
                        <div className="absolute top-4 right-4 w-12 h-12 bg-amber-500/10 rounded-full blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <span className="text-amber-500 text-6xl md:text-7xl font-black mb-2 transition-transform duration-500 group-hover/card:scale-110 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            {userGameStat?.tournamentWins || 0}
                        </span>
                        <span className="text-slate-500 text-[11px] font-black tracking-[0.3em] uppercase">Tournament Titles</span>
                    </div>
                </div>

                {/* Progress Visualizer */}
                <div className="bg-slate-800/30 border border-white/5 p-6 md:p-8 rounded-[2rem] backdrop-blur-md relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                            <span className="text-white text-lg font-bold tracking-tight">Arena Dominance</span>
                        </div>
                        <span className="text-slate-400 text-sm font-medium italic">
                            Overall win rate based on {totalGames} matches
                        </span>
                    </div>
                    
                    <div className="relative h-6 w-full bg-slate-950/50 rounded-full border border-white/5 p-1 overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-[2000ms] ease-out"
                            style={{ width: `${winRate}%` }}
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}