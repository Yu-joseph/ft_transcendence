import { useEffect, useRef, useState } from 'react';
import { useAuth } from "../../../auth/useAuth";
import { fetchClient } from '../../utils/fetchClient';
import type { MessageItem, MessageState } from '../../pages/Chat';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaExclamation } from 'react-icons/fa';
import { Clock } from 'lucide-react';
import { ErrorMessage, type TypeOfError } from '../shared/ErrorMessage';

interface UserInfo {
    id: string
    username: string
    status: string
    avatar: string
}

interface ChatMessageProp {
    friendId: string | null
    messages: MessageItem[]
    convId: number | null
    isTyping: boolean
}  

export function ChatMessage({messages, friendId, convId, isTyping} : ChatMessageProp) {
    const   [loading, setLoading] = useState<boolean>(false);
    const   [error, setError] = useState<string | null>(null);
    const   [friendInfo, setFriendInfo] = useState<UserInfo | null>(null);
    const   { user } = useAuth();
    const   currentUserId = user?.id as string;
    const   navigate = useNavigate();
    const   scroolToBottomRef = useRef<HTMLDivElement | null>(null);
    /**__________ HOOKS ____________________ */
    useEffect(() => { // for auto-scrolling to the last message
        scroolToBottomRef.current?.scrollIntoView();
    }, [messages, isTyping])

    useEffect(() => {
        if(friendId === null)
            return;
        loadUserInfo();
    }, [friendId, user, convId])
    
    /**__________ JS Function ___________ */
    
    const   loadUserInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const   result = await fetchClient<UserInfo>(`/friend/${friendId}`, {});
            setFriendInfo(result);
        } catch (err: any) {
            console.log(err);
            setFriendInfo(null);
            setError(err.message || 'Failed to load user info');
            navigate('/');
        } finally {
            setLoading(false);
        }
    }
    
    const   handleViewProfile = (userId: string | undefined) => {
        if(!userId)
            navigate('/');
        navigate(`/Profile/${userId}`);
    }
    const   detectMessageStatIcon = (state: MessageState) => {
        if(state === 'sent')
            return <FaCheck size={10} className='text-green-400'/>
        return state === 'pending' ? <Clock size={10} className='text-amber-500' /> : <FaExclamation size={10} className='text-red-600' />
    }
    /**__________ Component-Style __________________ */

    if (loading && friendId !== null) {
        return (
            <div className="flex-1 flex flex-col animate-pulse">
                <header className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/60 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                    <div className="h-4 w-32 bg-slate-700 rounded"></div>
                </header>
                <div className="flex-1 p-4 space-y-4 bg-slate-900/60">
                    {[1, 2, 3,4 , 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className="w-1/2 h-12 bg-slate-800 rounded-2xl animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    if (error) {
        const type: TypeOfError = 'messages';
        return <ErrorMessage message={error} typeOfError={type} />
    }

    if (friendId === null)
        return (
        <div className="flex items-center justify-center w-full h-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full text-center">
                <div className="inline-block mb-4 p-4 rounded-full bg-slate-500/10 text-3xl sm:text-4xl text-white">
                    💬
                </div> 
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-snug">
                        Select a Conversation to start messaging. 
                    </p> 
                    <p className="mt-2 text-sm text-slate-400">
                        Choose a friend from the list on the left to begin. 
                    </p>
            </div> 
        </div>);
    /**_____________________________________________________________________________ */
    return (
        <>
            <header className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/60 flex justify-between items-center sticky top-0 z-10">
                <div className="w-full flex items-center gap-4 cursor-pointer"
                    onClick={() => handleViewProfile(friendInfo?.id)}
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex justify-center items-center text-white font-bold shadow-md">
                            <img
                                src={`${friendInfo?.avatar}`}
                                alt="User Avatar"
                                className="w-full h-full object-cover rounded-full flex items-center justify-center"
                            />
                            {/* {friendInfo && friendInfo.username.charAt(0).toLocaleUpperCase()} */}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div>
                        <h3 className="text-lg text-white font-bold leading-tight">
                            {friendInfo && friendInfo.username}
                        </h3>
                        <p className="text-xs text-green-400 font-medium">{friendInfo && friendInfo.status}</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" >
                {
                    messages.length === 0 ? <div className='text-slate-300 flex items-center justify-center h-full'>Say Hello!</div> :
                    Array.isArray(messages) && messages.map(m => {
                        const   isMe = m.User.id === currentUserId;
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl p-3 shadow-md ${isMe ? 'bg-blue-600 text-white rounded-tr-sm border-2 border-slate-700/50' : 'bg-slate-800 text-slate-200 border-2 border-slate-700/50 rounded-tl-sm'}`}>
                                    <p className='text-sm leading-relaxed'>
                                    {m.content}
                                    </p>
                                    <div className={`gap-1.5 text-[10px] mt-1 flex ${isMe ? 'text-blue-200 justify-end' : 'text-slate-400 justify-start'} items-center`}>
                                        {(m.status === 'sent' || m.status === null)  && new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                        {m.status && <span>{detectMessageStatIcon(m.status)}</span>} 
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
                {
                    isTyping && (
                        <div className="flex justify-start">
                            <div className='bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-sm italic animate-pulse'>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                            </div>
                            </div>
                        </div>
                    )
                }
                <div ref={scroolToBottomRef}></div>
            </div>
        </>
    );
}