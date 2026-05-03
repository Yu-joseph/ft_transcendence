
// Profiel UI that i display in loading user information
export const SkeletonProfileUi = () => {
    return (
        <div className="space-y-8 md:space-y-12 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800/50 shrink-0 shadow-inner"></div>
                
                <div className="flex-1 w-full space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="h-10 w-48 bg-slate-800/50 rounded-2xl"></div>
                        <div className="flex gap-2">
                            <div className="h-6 w-24 bg-slate-800/30 rounded-full"></div>
                            <div className="h-6 w-24 bg-slate-800/30 rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <div className="h-8 w-32 bg-slate-800/30 rounded-xl"></div>
                        <div className="h-8 w-40 bg-slate-800/30 rounded-xl"></div>
                        <div className="h-8 w-28 bg-slate-800/30 rounded-xl"></div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 w-full max-w-xl bg-slate-800/30 rounded-lg"></div>
                        <div className="h-4 w-3/4 max-w-xl bg-slate-800/30 rounded-lg"></div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <div className="h-12 w-32 bg-slate-800/50 rounded-2xl"></div>
                        <div className="h-12 w-32 bg-slate-800/50 rounded-2xl"></div>
                    </div>
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 md:p-10">
                <div className="flex justify-between items-end mb-10">
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-800/30 rounded-lg"></div>
                        <div className="h-8 w-48 bg-slate-800/50 rounded-xl"></div>
                    </div>
                    <div className="h-10 w-24 bg-slate-800/30 rounded-2xl"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="h-48 bg-slate-800/40 rounded-3xl"></div>
                    <div className="h-48 bg-slate-800/40 rounded-3xl"></div>
                    <div className="h-48 bg-slate-800/40 rounded-3xl"></div>
                </div>

                <div className="h-24 bg-slate-800/30 rounded-[2rem] p-8">
                    <div className="h-4 w-full bg-slate-950/50 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}