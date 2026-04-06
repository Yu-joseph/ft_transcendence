import React, { useEffect, useState } from 'react';
import  {IoEllipsisHorizontal} from 'react-icons/io5';

import { useAuth } from "../../../auth/useAuth";

import { fetchClient } from '../../utils/fetchClient';
import type { MessageItem } from '../../pages/Chat';

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
    setConvId: React.Dispatch<React.SetStateAction<number | null>>
    setFriendId: React.Dispatch<React.SetStateAction<string | null>>
    setDeletedConv: React.Dispatch<React.SetStateAction<number | null>>
    isTyping: boolean
}  

export function ChatMessage({messages, friendId, convId, setConvId, setFriendId, setDeletedConv, isTyping} : ChatMessageProp) {
    const   [isDropDown, setIsDropDown] = useState<boolean>(false);
    const   [friendInfo, setFriendInfo] = useState<UserInfo | null>(null);
    const { user } = useAuth();
    const   currentUserId = user?.id as string;


    useEffect(() => {
        console.log("In chat Message, messages is:", messages);
        if(!friendId)
            return;
        const   loadUserInfo = async () => {
            try {
                const   result = await fetchClient<UserInfo>(`/friend/${friendId}`, {});
                setFriendInfo(result);
            } catch (err: any) {
                console.log(err);
            }
        }
        loadUserInfo();
    }, [friendId])

    /*********** Botton click************** */
    const handleRemoveConversation = async () => {
        try {
            setIsDropDown(!isDropDown);
            const   result = await fetchClient<number>(`/chat/conversations/${convId}`, {
                method: 'DELETE',
            });
            console.log("deleted conversation", result);
            if(result !== convId)
                console.log('Ooops i remove another conversations');
            setDeletedConv(result);
            setConvId(null);
            setFriendId(null);
        } catch (err: any) {
            console.log(err.message);
        }
    }

    if (!friendId) {
        return (<div className="flex items-center justify-center w-full h-full px-4 py-6 sm:px-6 lg:px-8">
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
        
    }
    return (
        <>
            <header className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/60 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4 cursor-pointer"
                    onClick={() => console.log('to Profile now')}
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex justify-center items-center text-white font-bold shadow-md">
                            {friendInfo && friendInfo.username.charAt(0).toLocaleUpperCase()}
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
                <div className="relative">
                    <button
                        onClick={() => setIsDropDown(!isDropDown)}
                        className='w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer'>
                        <IoEllipsisHorizontal size={20}/>
                    </button>
                    {
                        isDropDown &&
                        <div
                            className='absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200'
                        >
                            <ul className='flex flex-col'>
                                <li>
                                    <button
                                        onClick={handleRemoveConversation}
                                        className='w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-slate-700/50 transition-colors'
                                        >
                                            Remove Conversation
                                    </button>
                                </li>

                            </ul>
                        </div>
                    }
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
                                    <div className={`text-[10px] mt-1 flex ${isMe ? 'text-blue-200 justify-end' : 'text-slate-400 justify-start'}`}>
                                        {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
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
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-spin delay-300"></span>
                            </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}