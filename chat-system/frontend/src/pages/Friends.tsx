import { useState } from "react";
import { FriendsList } from "../components/friends/FriendsList";
import  { Users, Clock, UserPlus }   from 'lucide-react';

type    TabTypes = 'friends' | 'pending' | 'add';

export function Friend() {
    const   [activeTab, setActivetab] = useState<TabTypes>('friends');

    const   renderContent = () => {
        switch (activeTab) {
            case 'friends':
                return <FriendsList/>;
            case 'pending':
                return <div className="p-8 text-white">Pending friend request goes here...</div>;
            case 'add':
                return <div className="p-8 text-white">Add friend components goes hrer...</div>
            default:
                return <FriendsList/>
        }
    }
    return (
        <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden">
            <div className="flex items-center px-4 h-12 border-b border-slate-700/50 bg-slate-800/80 shrink-0">
                <div className="flex items-center text-slate-300 font-semibold gap-2 mr-6">
                    <Users size={20} className="text-slate-400"/>
                    <span>Friends</span>
                </div>
                <div className="w-px bg-slate-700 h-6 mx-2"></div>
                <nav className="flex items-center gap-4">
                    <button 
                        onClick={() => setActivetab('friends')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                            activeTab === 'friends' ? 'bg-slate-700/60 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}>
                        All Friends
                    </button>
                    <button
                        onClick={() => setActivetab('pending')} 
                        className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer flex items-center gap-2 transition-colors ${
                            activeTab === 'pending' ? 'bg-slate-700/60 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}>
                            <Clock size={16}/>
                            Pending
                    </button>
                    <button
                        onClick={() => setActivetab('add')}
                        className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer flex items-center gap-2 transition-colors ${
                            activeTab === 'add' ? 'bg-emerald-600 text-white' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                        }`}>
                            <UserPlus size={16}/>
                            Add Friend
                    </button>
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto">
                        {renderContent()}
            </div>
        </div>
    );
}