import { useConversationList } from "./hooks/useConversationList";
import { ErrorMessage, type TypeOfError } from "../shared/ErrorMessage";
import { useNavigate } from "react-router-dom";

interface ConversationListProps {
    onSelectConversation: (convId: string, friendId: string) => void;
    // setConvId: React.Dispatch<React.SetStateAction<string | null>>;
    convId: string | null
    // selectFriendId: React.Dispatch<React.SetStateAction<string | null>>
    friendId: string | null
}

export function ConversationList({ onSelectConversation, convId, friendId }: ConversationListProps) {
    /**______ Costume Hooks _______________ */
    const { loading, error, conversationList } = useConversationList(friendId);
    const navigate = useNavigate();

    /**________ Component-Style __________________ */
    if (loading) {
        return (
            <aside className="w-1/3 md:w-80 flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-xl">
                <div className="pb-2 mb-2">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-800">
                    <ul className="space-y-2 mt-2 flex-1 pr-2">
                        {/* Create an array of 6 items to show a list of fake loading components */}
                        {[1, 2, 3, 4, 5].map((item) => (
                            <li key={item} className="flex items-center gap-4 p-3 rounded-3xl">
                                {/* Avatar Skeleton */}
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-slate-700 animate-pulse"></div>
                                </div>

                                {/* Lines Skeleton */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between item-baseline mb-2">
                                        {/* Username placeholder */}
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                                        {/* Time placeholder */}
                                        <div className="h-3 w-8 bg-slate-700 rounded animate-pulse"></div>
                                    </div>
                                    {/* Message body placeholder */}
                                    <div className="h-3 w-3/4 bg-slate-700 rounded animate-pulse mt-1"></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        );
    }
    if (error) {
        const type: TypeOfError = 'conversations';
        return <ErrorMessage message={error.message ?? null} typeOfError={type} />
    }

    return (
        <aside className="w-full h-full flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-xl overflow-hidden">
            
            <div className="px-6 py-5 border-b border-white/5 shrink-0">
                <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <ul className="p-2 space-y-1">
                    {conversationList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20 opacity-50">
                            <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-slate-200 font-medium">No messages yet</h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-[200px]">
                                Start a conversation with a friend to see it here.
                            </p>
                            <button
                                onClick={() => navigate('/Friends')}
                                className="mt-6 px-4 py-2 bg-indigo-500/10 text-indigo-400 text-sm font-semibold rounded-xl hover:bg-indigo-500 hover:text-white transition-colors"
                            >
                                Find Friends
                            </button>
                        </div>
                    ) : (
                        conversationList.map((conv) => (
                            <li
                                onClick={() => {
                                    onSelectConversation(conv.id, conv.otherUser.id as string)
                                    // setConvId(conv.id);
                                    // selectFriendId(conv.otherUser.id as string);
                                }}
                                key={conv.id}
                                className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                                    convId === conv.id 
                                    ? 'bg-slate-800/80 shadow-md' 
                                    : 'hover:bg-slate-800/40'
                                }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800">
                                        <img
                                            src={`${conv.otherUser.avatar}`}
                                            alt={conv.otherUser.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`absolute w-3 h-3 bottom-0 right-0 ${conv.otherUser.user_status === 'Online' ? 'bg-emerald-500' : 'bg-slate-500'} rounded-full border-2 border-slate-900`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`text-[15px] font-semibold truncate pr-2 transition-colors ${convId === conv.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                            {conv.otherUser.username}
                                        </h3>
                                        <span className="text-xs text-slate-500 font-medium shrink-0">
                                            {conv.lastMessage?.created_at && new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${convId === conv.id ? 'text-slate-300' : 'text-slate-400'}`}>
                                        {conv.lastMessage?.content || 'No message yet'}
                                    </p>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </aside>
    );
}