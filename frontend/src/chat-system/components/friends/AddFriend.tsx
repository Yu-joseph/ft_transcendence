import { UserPlus, Search } from "lucide-react";
import { useAddFriend } from "./hooks/useAddFriend";

export  function AddFriend() {
    const   {
        handleSubmit,
        setInput,
        input,
        loading,
        state } = useAddFriend();

    /**____ Component-Style _________ */

    return (
        <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-6 lg:p-6">
            <div className="mb-6">
                <h1 className="text-3xl text-white font-bold flex items-center gap-3">
                    <UserPlus className="text-blue-400" size={32}/>
                    Add Friend
                </h1>
                <p className="text-slate-400 mt-1">You can add friends wiht their exact username.</p>
            </div>
            <form className="mb-12 max-w-2xl mx-auto w-full" onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full group">
                    <div className="relative flex-1 flex items-center">
                        <div className="absolute left-5 flex items-center pointer-events-none">
                            <Search className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={20}/>
                        </div>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            type="text"
                            placeholder="Enter username to add..."
                            className="w-full bg-slate-800/40 border border-white/5 rounded-2xl text-slate-100 py-4 pl-14 pr-4 placeholder-slate-500
                            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 shadow-inner"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || input.trim().length === 0}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800/60 disabled:text-slate-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300
                        shadow-lg shadow-indigo-500/10 active:scale-95 shrink-0">
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
                {state && (
                    <div className={`text-sm font-bold mt-4 px-2 animate-in fade-in slide-in-from-top-2 ${state?.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {state?.message}
                    </div>
                )}
            </form>

            <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-white/5 rounded-[2.5rem] bg-slate-800/20 max-w-2xl mx-auto w-full">
                <div className="p-6 rounded-full bg-slate-800/50 mb-6">
                    <UserPlus className="text-slate-500" size={40}/>
                </div>
                <h3 className="text-slate-200 text-xl font-bold tracking-tight">Looking to connect?</h3>
                <p className="text-slate-500 text-center max-w-sm mt-3 leading-relaxed">
                    Expand your social circle. Enter a teammate's username to start chatting and playing together.
                </p>
            </div>
        </div>
    );
}