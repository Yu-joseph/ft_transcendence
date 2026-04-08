import React, { useState} from 'react';
import  { IoSend }  from 'react-icons/io5';
import { fetchClient } from '../../utils/fetchClient';
import type { MessageItem}   from    '../../pages/Chat';

interface ChatInputPorps {
    convId: number | null
    setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>
}

export  function    ChatInput({setMessages, convId}: ChatInputPorps) {
    const   [input, setInput] = useState<string>('');
    const   sendMessage = async (message: string) => {
        try {
            const   result = await fetchClient<MessageItem>(`/chat/conversations/${convId}/message`, {
                method: 'POST',
                body: JSON.stringify({content: message})
            });
            console.log('sended message:',result);
        } catch (err:any) {
            console.log(err);
            setMessages([]);
        }
    }

    const   handleSendMessage = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        const   message: string = input.trim();
        if(message === '') {
            console.log('message cannot be empty');
            setInput('');
            return ;
        }
        sendMessage(message);
        setInput('');
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
                    onChange={(e) => setInput(e.target.value)}
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