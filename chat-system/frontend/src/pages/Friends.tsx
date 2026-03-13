import { useState } from "react";
import { FriendsList } from "../components/friends/FriendsList";
import  { Users, Clock, UserPlus, Ban }   from 'lucide-react';
import { PendingRequests } from "../components/friends/PendingRequests";
import { AddFriend } from "../components/friends/AddFriend";
import { BlockedFriend } from "../components/friends/BlockedFriend";

type    TabTypes = 'friends' | 'pending' | 'add' | 'blocked';

export function Friend() {
    const   [activeTab, setActivetab] = useState<TabTypes>('friends');

    const   renderContent = () => {
        switch (activeTab) {
            case 'friends':
                return <FriendsList/>;
            case 'pending':
                return <PendingRequests/>;
            case 'add':
                return <AddFriend/>
            case 'blocked':
                return <BlockedFriend/>
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
                    <button
                        onClick={() => setActivetab('blocked')}
                        className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer flex items-center gap-2 transition-colors ${
                            activeTab === 'blocked' ? 'bg-red-500/20 text-red-500' : 'text-slate-400  hover:bg-slate-800 hover:text-red-400'
                        }`}>
                            <Ban size={16}/>
                            Blocked
                    </button>
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto">
                        {renderContent()}
            </div>
        </div>
    );
}