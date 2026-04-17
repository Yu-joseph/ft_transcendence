import { UserPlus, Search } from "lucide-react";
import { useAddFriend } from "./hooks/useAddFriend";

export  function AddFriend() {
    const   {
        handleSubmit,
        setInput,
        input,
        loading,
        status } = useAddFriend();

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
            <form className="mb-8" onSubmit={handleSubmit}>
                <div className="relative group flex items-center">
                    <div className="absolute left-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-blue-400 transition-all" size={20}/>
                    </div>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        type="text"
                        placeholder="enter username"
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl text-white py-4 pl-12 pr-36 placeholder-slate-500
                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading || input.trim().length === 0}
                        className="bg-blue-600 absolute right-2 px-6 py-2 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
                    {status && (
                        <div className={status.type === 'success' ? 'text-emerald-400 mt-2' : 'text-red-500 mt-2'}>
                            {status.message}
                        </div>
                    )}
            </form>
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
                <UserPlus className="text-slate-500 mb-4" size={48}/>
                <h3 className="text-slate-300 text-lg font-medium">Looking to connect?</h3>
                <p className="text-slate-500 text-sm mt-2">Enter a username above to send friend request.</p>
            </div>
        </div>
    );
}