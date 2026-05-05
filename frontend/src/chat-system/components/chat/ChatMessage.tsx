import { useEffect, useRef, useState } from 'react';
import { useAuth } from "../../../auth/useAuth";
import { fetchClient } from '../../utils/fetchClient';
import type { MessageItem, MessageState } from '../../pages/Chat';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaExclamation } from 'react-icons/fa';
import { Clock, MessageCircle } from 'lucide-react';
import { ErrorMessage, type TypeOfError } from '../shared/ErrorMessage';
import { chatSocket } from '../../../socket/sock';
import { withMediaPrefix } from '../shared/sharedUtils';

interface UserInfo {
    id: string
    username: string
    user_status: string
    avatar: string
}

interface ChatMessageProp {
    friendId: string | null
    messages: MessageItem[]
    convId: string | null
    isTyping: boolean
    isLoading: boolean
    onBack?: () => void
}

export function ChatMessage({ messages, friendId, convId, isTyping, isLoading, onBack }: ChatMessageProp) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [friendInfo, setFriendInfo] = useState<UserInfo | null>(null);
    const { user } = useAuth();
    const currentUserId = user?.id;
    const navigate = useNavigate();
    const scroolToBottomRef = useRef<HTMLDivElement | null>(null);
    /**__________ HOOKS ____________________ */

    useEffect(() => { // for auto-scrolling to the last message
        setTimeout(() => {
            scroolToBottomRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 50);
    }, [messages, isTyping, user?.id])

    /**________________________________________________* */
    useEffect(() => {
        const onUpdateStatus = (data: { userId: string, status: string }) => {
            if (!data || !data.userId)
                return;
            setFriendInfo(prev => {
                if (!prev || prev.id !== data.userId) {
                    return prev;
                }
                return { ...prev, user_status: data.status };
            });

        }
        chatSocket.on('status:update', onUpdateStatus);

        return () => { chatSocket.off('status:update', onUpdateStatus) }
    }, [user?.id])

    /********************************************************************* */
    useEffect(() => {
        if (friendId === null)
            return;
        const loadUserInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchClient<UserInfo>(`/friend/${friendId}`, {});
                if (result && result.id) {
                    result.avatar = withMediaPrefix(result.avatar) ?? '';
                    setFriendInfo(result);
                }
            } catch (err: any) {
                setFriendInfo(null);
                setError(err.message || 'Failed to load user info');
            } finally {
                setLoading(false);
            }
        }
        loadUserInfo();
    }, [friendId, user?.id, convId])

    /**__________ JS Function ___________ */

    const handleViewProfile = (userId: string | undefined) => {
        if (!userId) {
            return;
        }
        navigate(`/Profile/${userId}`);
    }
    const detectMessageStatIcon = (state: MessageState) => {
        if (state === 'sent')
            return <FaCheck size={10} className='text-indigo-200' />
        return state === 'pending' ? <Clock size={10} className='text-slate-300' /> : <FaExclamation size={10} className='text-rose-400' />
    }
    /**__________ Component-Style __________________ */

    if (loading && friendId !== null) {
        return (
            <div className="flex-1 flex flex-col animate-pulse bg-slate-900/30">
                <header className="px-6 py-4 border-b border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                    <div className="h-4 w-32 bg-slate-800 rounded"></div>
                </header>
                <div className="flex-1 p-6 space-y-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`w-1/2 h-12 bg-slate-800/80 rounded-2xl`}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    if (error) {
        const type: TypeOfError = 'messages';
        return <div className="flex-1 flex items-center justify-center p-6"><ErrorMessage message={error} typeOfError={type} /></div>
    }

    if (friendId === null)
        return (
            <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-900/30">
                <div className="max-w-md flex flex-col items-center opacity-60">
                    <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-slate-800/80 text-slate-400 shadow-inner">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-200 tracking-tight mb-2">Your Messages</h2>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                        Select a conversation from the sidebar to start chatting.
                    </p>
                </div>
            </div>);
    /**_____________________________________________________________________________ */
    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/40">
                {/* header of the messages window */}
            <header className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3 md:gap-4 w-full">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleViewProfile(friendInfo?.id)}>
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden bg-slate-800">
                                <img
                                    src={`${friendInfo?.avatar}`}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className={`absolute w-3 h-3 bottom-0 right-0 ${friendInfo?.user_status === 'Online' ? 'bg-emerald-500' : 'bg-slate-500'} rounded-full border-2 border-slate-900`}></div>
                        </div>
                        <div>
                            <h3 className="text-[15px] md:text-base text-white font-semibold leading-tight group-hover:text-indigo-400 transition-colors">
                                {friendInfo?.username}
                            </h3>
                            <p className={`text-[11px] font-medium tracking-wide ${friendInfo?.user_status === 'Online' ? 'text-emerald-500' : 'text-slate-500'} mt-0.5`}>
                                {friendInfo?.user_status}
                            </p>
                        </div>
                    </div>
                </div>
            </header>
            {/* ***  here messages or history of messages displayed   ** */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar flex flex-col gap-4" >
                {
                    isLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div 
                                    key={i} 
                                    className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}
                                >
                                    <div className="w-2/3 h-12 bg-slate-800/40 rounded-2xl rounded-bl-sm" />
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        /*  Show empty state if no messages on that conv */
                        <div className='flex flex-col items-center justify-center h-full opacity-40'>
                            <div className="p-4 bg-slate-800/50 rounded-full mb-3">
                                <MessageCircle size={32} className="text-slate-400" />
                            </div>
                            <p className="text-slate-400 font-medium tracking-tight">Say Hello!</p>
                        </div>
                    ) : (
                        Array.isArray(messages) && messages.map((m, index) => {
                            const isMe = m.User.id === currentUserId;
                            return (
                                <div key={m.id ? m.id : m.tempId || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] sm:max-w-[70%] group relative`}>
                                        <div className={`px-4 py-2.5 shadow-sm ${
                                            isMe 
                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                                            : 'bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm'
                                        }`}>
                                            <p className='text-[15px] leading-relaxed break-words'>
                                                {m.content}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-[10px] font-medium text-slate-500 tracking-tight">
                                                {(m.status === 'sent' || m.status === null) && new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {m.status && isMe && <span className="opacity-70">{detectMessageStatIcon(m.status)}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )
                }
                {/* ** here display the typing indicator animation  * */}
                {
                    isTyping && (
                        <div className="flex justify-start">
                            <div className='bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm'>
                                <div className="flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* **  this ldiv is the last item of that window it used for auto-scrolling using useRef() ** */}
                <div ref={scroolToBottomRef} className="h-1"></div>
            </div>
        </div>
    );
}