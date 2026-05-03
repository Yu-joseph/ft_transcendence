import { MessageCircle, UserX, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useFriendList } from "./hooks/useFriendList";
import { ErrorMessage, type TypeOfError } from "../shared/ErrorMessage";

export function FriendsList() {
    /**__________ Costum Hook _____________ */
    const   {
        handleRemoveFriend,
        handleStartConversation,
        setActivetab,
        goChat,
        activeTab,
        fiteredFriend,
        loading,
        error
    } = useFriendList();

    /**_________ Component-Style ___________ */
        
    if(goChat){
        return <Navigate state={{selectedFriendId: goChat}} to={`/Chat` }/>
    }
    const   type: TypeOfError = 'friends';

    return (
        <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-6 lg:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <Users className="text-indigo-400" size={32} />
                        Friends
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your connections and chat</p>
                </div>
                <div className="flex w-full md:w-auto bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                    <button
                        onClick={() => setActivetab('All')}
                        className={`flex-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                         ${activeTab === 'All' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActivetab('Online')}
                        className={`flex-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all 
                            ${activeTab === 'Online' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                    >
                        Online
                    </button>
                    <button
                        onClick={() => setActivetab('Offline')}
                        className={`flex-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all 
                            ${activeTab === 'Offline' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                    >
                        Offline
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 overflow-y-auto w-full">
                {
                    loading && (
                    [1,2,3,4].map((i) => (
                            <div
                                key={i}
                                className="group relative flex flex-col items-center justify-center bg-slate-800/40 backdrop-blur-md
                                border border-white/5 rounded-3xl p-8 shadow-xl animate-pulse"
                            >
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-slate-700/20">
                                        <div className="w-24 h-24 rounded-full bg-slate-700/30"></div>
                                        <span className="w-6 h-6 bg-slate-700/40 absolute bottom-1 right-1 rounded-full border-2 border-slate-900"></span>
                                    </div>
                                </div>
                                <div className="bg-slate-700/40 h-5 w-32 mb-6 rounded-full"></div>
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex-1 h-10 bg-slate-700/40 rounded-xl"></div>
                                    <div className="w-10 h-10 bg-slate-700/30 rounded-xl"></div>
                                </div>
                            </div>)
                        )
                    )
                }
                {
                    !loading && error && (
                            <ErrorMessage message={error ?? null} typeOfError={type} />
                    )
                }
                {!loading && !error && fiteredFriend.map((fr) => {
                    return (
                        <div
                            key={fr.id}
                            className="group relative flex flex-col items-center justify-center bg-slate-800/40 backdrop-blur-md
                            border border-white/5 rounded-3xl p-8 shadow-xl hover:border-indigo-500/30 hover:bg-slate-800/60 
                            hover:-translate-y-2 transition-all duration-300 ease-out"
                        >
                            <div className="relative mb-6">
                                <div className="relative p-1 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20">
                                    <img
                                        src={`${fr.avatar}`}
                                        alt={fr.username}
                                        className="w-24 h-24 rounded-full object-cover shadow-2xl"
                                    />
                                </div>
                                <div className={`absolute w-6 h-6 bottom-1 right-1 ${fr.user_status === 'Online' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-500'} rounded-full border-2 border-slate-900`}></div>
                            </div>
                            
                            <h3 className="text-slate-100 font-bold text-lg mb-6 tracking-tight">{fr.username}</h3>
                            
                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={() => {handleStartConversation(fr.id)}}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 px-4
                                    rounded-xl transition-all duration-300 font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-95">
                                    <MessageCircle size={18} />
                                    <span>Chat</span>
                                </button>
                                <button 
                                    onClick={() => handleRemoveFriend(fr.id)}
                                    className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 group/btn" title="Remove Friend">
                                        <UserX size={20} className="group-hover/btn:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}