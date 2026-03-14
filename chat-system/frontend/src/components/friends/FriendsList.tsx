import { MessageCircle, UserX, Users } from "lucide-react";
import { useState } from "react";


export function FriendsList() {
    // const   [friendList, setFriendList] = useState(null);

    // useEffect(() => {
    //     const   fetchUserList = () => {

    //     }
    // }, [userId])


    const friends = [
        { id: 1, avatar: '', username: 'user1', created_at: new Date, status: 'Online' },
        { id: 2, avatar: '', username: 'user2', created_at: new Date, status: 'Online' },
        { id: 3, avatar: '', username: 'user3', created_at: new Date, status: 'Offline' },
        { id: 4, avatar: '', username: 'user4', created_at: new Date, status: 'Online' },
        { id: 5, avatar: '', username: 'user5', created_at: new Date, status: 'Offline' },
        { id: 6, avatar: '', username: 'user6', created_at: new Date, status: 'Online' },
        { id: 7, avatar: '', username: 'user7', created_at: new Date, status: 'Online' },
    ];
    const [activeTab, setActivetab] = useState('Offline');
    const fiteredFriend = friends.filter((friend) => {
        if (activeTab === 'All') return true;
        return activeTab === friend.status;
    })
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
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 overflow-y-auto w-full">
                {fiteredFriend.map((fr) => {
                    return (
                        <div
                            key={fr.id}
                            className="group relative flex flex-col items-center justify-center bg-slate-800/40 backdrop-blur-xl
                        border border-slate-700/50 rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-600
                                flex items-center justify-center text-white font-bold text-3xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                                    {fr.username.charAt(0).toLocaleUpperCase()}
                                </div>
                                <div className={`absolute w-6 h-6 bottom-0 right-0 ${fr.status === 'Online' ? 'bg-green-500' : 'bg-slate-500'} rounded-full border-2 border-slate-800`}></div>
                            </div>
                            <h3 className="text-white font-medium">{fr.username}</h3>
                            <p className="text-white text-sm">{fr.id}</p>
                            <div className="flex items-center gap-3 w-full">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4
                                rounded-xl transition-colors duration-300 font-medium text-sm shadow-md shadow-indigo-500/20">
                                    <MessageCircle size={18} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors duration-300" title="Remove Friend">
                                    <UserX size={20} />
                                </button>
                                {/* <MoreVertical/> */}
                            </div>

                        </div>
                        // <div className="bg-amber-600">
                        // </div>
                    );
                })}
            </div>
        </div>
    );
}