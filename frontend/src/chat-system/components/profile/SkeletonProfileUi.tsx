
// Profiel UI that i display in loading user information
export const SkeletonProfileUi = () => {

    return (
        <>
        <div className="bg-slate-900/40  rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden  animate-pulse">
            <div className="relative shrink-0">
                <div className="bg-slate-800/20 w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-slate-800/30 p-1">
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900 h-5 w-5 rounded-full border-4 border-slate-900 shadow-sm"></div>
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="">
                    <h1 className="h-6 w-25 rounded-2xl flex items-center gap-2 md:text-4xl bg-slate-800/30">
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="mt-1 flex items-center gap-1.5 bg-slate-500/10 text-slate-900/10 px-3 py-1 rounded-lg"></div>
                        <div className="flex items-center gap-1.5 bg-slate-500/10 px-3 py-1 rounded-lg"></div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2 bg-slate/5 px-3 py-1.5 rounded-full bg-slate-800"></div>

                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full"></div>
                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full"></div>
                    </div>
                </div>

                <p className="mt-3 text-sm max-w-xl mx-auto md:mx-0 leading-relaxed text-slate-900/90 bg-slate-900/90 rounded-2xl">{ 'No description'}</p>
            </div>

            <div className="flex flex-col sm:flex-row w-full gap-3 md:w-auto mt-4 md:mt-0 justify-center text-slate-900/90">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <span className="flex-1 flex items-center justify-center gap-2 bg-slate-900/90 text-slate-900/90 px-5 py-3 rounded-xl"></span>
                    <span className={`bg-slate-900/90 flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium`}></span>
                </div>
            </div>
        </div>
        <div className="bg-slate-900/50 rounded-2xl p-6 md:p-8 relative overflow-hidden w-full animate-pulse">

            <div className="grid grid-cols-2 lg:grid-cols-4 grid-colse gap-4 md:gap-8 mb-8">
                <div className="bg-slate-800/30 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center"></div>
                <div className="bg-slate-800/30 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center"></div>
                <div className="bg-slate-800/30 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center"></div>
                <div className="bg-slate-800/30 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center"></div>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl">
                <div className="h-4 w-full bg-slate-700/30 rounded-full overflow-hidden shadow-inner flex"></div>
            </div>
        </div>
        </>
    );

}