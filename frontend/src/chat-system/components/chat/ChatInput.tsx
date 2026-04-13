import React, { useRef, useState} from 'react';
import  { IoSend }  from 'react-icons/io5';
import { fetchClient } from '../../utils/fetchClient';
import type { MessageItem, MessageState}   from    '../../pages/Chat';
import { chatSocket } from '../../../socket/sock';
import type { JoinChatInf } from '../../hooks/useChatSocket';
import  {useAuth}   from    '../../../auth/useAuth';

interface ChatInputPorps {
    convId: number | null
    setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>
}

interface MessageToSendType {
    content: string
    tempId: string
    status: MessageState
}

export  function    ChatInput({setMessages, convId}: ChatInputPorps) {
    const   ROOM_ID: string = `ROOM_${convId}`;

    const   [input, setInput] = useState<string>('');
    const   [isTyping,  setIsTyping] = useState<boolean>(false);
    const   typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const   {user} = useAuth();

    const   handleSendMessage = async (event: React.SyntheticEvent) => {
        if(user === null || convId === null)
            return;
        event.preventDefault();
        const   message: string = input.trim();
        if(message === '') {
            console.log('message cannot be empty');
            setInput('');
            return ;
        }
        const   messageToSend: MessageToSendType = {
            content: message,
            tempId: String(Date.now()),
            status: 'pending'
        }
        setMessages(prev => [...prev, {
            id: messageToSend.tempId,
            content: messageToSend.content,
            User: {id: user.id, username: user.username},
            created_at: new Date().toLocaleTimeString(),
            status: 'pending',
            tempId: messageToSend.tempId
        }]); // here render new message for the sender before sending http-req
        try {
            setTimeout(async () => {
                const   response = await fetch((import.meta.env.VITE_CHAT_API as string ?? 'http://10.30.234.188:8080/api') + `/chat/conversations/${convId}/message`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(messageToSend)
                });
                const result = await response.json();
                if(!response.ok){
                    console.log("Falliled to send message:", messageToSend.content);
                    console.log('Message Error:', result.message);
                    setMessages(prev => prev.map(m => { // i update the new message to it's correspond status and id and created_at feom server
                        if(m.tempId !== result.data.tempId)
                            return m;
                        return {
                            ...m,
                            id: messageToSend.tempId,
                            created_at: result.data.created_at ?? '',
                            status: 'error'
                        };
                    }));
                    setInput('');
                    return ;
                }
                console.log('message sended===>:', result);
                setMessages(prev => prev.map(m => { // i update the new message to it's correspond status and id and created_at feom server
                    if(m.tempId !== result.data.tempId)
                        return m;
                    return {
                        ...m,
                        id: result.data.id,
                        created_at: result.data.created_at,
                        status: result.data.status ?? 'sent'
                    }
                })
        );
                
            }, 2000);

        } catch (err:any) {
            console.log(err);
            setMessages(prev => prev.map(m => m.tempId === messageToSend.tempId ? {...m, status: 'error'} : m ));
        }
        setInput('');
    }

    const   handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(user === null)
            return ;
        const   messageValue: string = e.target.value;
        setInput(messageValue);
        if(!isTyping && messageValue.length > 0) {
            // console.log('Typing start from me');
            chatSocket.emit('typing:start', {room_id: ROOM_ID, userId: user.id, convId: convId} as JoinChatInf)
            setIsTyping(true);
        }
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            chatSocket.emit('typing:stop', ROOM_ID);
            setIsTyping(false);
        }, 1000);
    }
    if(!convId)
        return <div className='h-0 w-0'></div>
    return (
        <footer className="px-6 py-4 border-t-2 border-slate-700/50 bg-slate-900/80 backdrop:blur-md sticky bottom-0 z-0">
            <div className='flex items-center gap-3'>
            </div>
            <form 
                onSubmit={handleSendMessage}
                className='flex-1 flex items-center bg-slate-800/80 border border-slate-700/50 rounded-full pr-1.5 pl-4
                 focus-within:border-indigo-500/50 transition-all duration-200 shadow-inner'>
                <input
                    type="text"
                    onChange={handleChange}
                    value={input}
                    className='flex-1 bg-transparent py-3 text-sm text-white placeholder:text-slate-500 outline-none'
                    placeholder='Type a message...'
                />
                <button type='submit' className='p-2 ml-2 bg-indigo-500 hover:bg-indigo-600 rounded-full flex justify-center items-center shrink-0 my-1
                                                text-white shadow-md transition-colors cursor-pointer'>
                    <IoSend size={18} className='translate-x-1'/>
                </button>
            </form>

        </footer>
    );
}