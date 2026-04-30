import { useState } from "react";
import { FriendsList } from "../components/friends/FriendsList";
import { Users, Clock, UserPlus, Ban } from 'lucide-react';
import { PendingRequests } from "../components/friends/PendingRequests";
import { AddFriend } from "../components/friends/AddFriend";
import { BlockedFriend } from "../components/friends/BlockedFriend";
import { useLocation } from "react-router-dom";

type TabTypes = 'friends' | 'pending' | 'add' | 'blocked';

export function Friends() {
    const   location = useLocation();
    const [activeTab, setActivetab] = useState<TabTypes>(location.state?.activeTab || 'friends');


    const renderContent = () => {
        switch (activeTab) {
            case 'friends':
                return <FriendsList />;
            case 'pending':
                return <PendingRequests />;
            case 'add':
                return <AddFriend />
            case 'blocked':
                return <BlockedFriend />
            default:
                return <FriendsList />
        }
    }
    return (
        <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden">
            <header className="sticky top-0 z-10 flex items-center px-6 h-14 backdrop-blur-xl bg-slate-900/70 border-b border-white/5 shrink-0">
                <div className="hidden md:flex items-center gap-3 mr-8 shrink-0">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Users size={20} className="text-indigo-400" />
                    </div>
                    <span className="text-slate-100 font-bold tracking-tight text-lg">Friends</span>
                </div>
                
                <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto">
                    <button
                        onClick={() => setActivetab('friends')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0 ${
                            activeTab === 'friends' 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}>
                        All Friends
                    </button>
                    <button
                        onClick={() => setActivetab('pending')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                            activeTab === 'pending' 
                            ? 'bg-slate-700/40 text-white border border-slate-600/50' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}>
                        <Clock size={16} />
                        Pending
                    </button>
                    <button
                        onClick={() => setActivetab('add')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                            activeTab === 'add' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-emerald-500/5 text-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}>
                        <UserPlus size={16} />
                        Add Friend
                    </button>
                    <button
                        onClick={() => setActivetab('blocked')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                            activeTab === 'blocked' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'text-slate-400 hover:text-rose-400/80 hover:bg-rose-500/5'
                        }`}>
                        <Ban size={16} />
                        Rejected
                    </button>
                </nav>
            </header>
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}