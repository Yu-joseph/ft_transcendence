import React, { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../auth/useAuth";
import { chatSocket } from '../../../../socket/sock';
// import type { JoinChatInf } from "./useChatSocket";
import type { MessageItem, MessageState } from "../../../pages/Chat";


export interface ChatInputPorps {
    convId: number | null
    setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>
    setSelectedFriendId: React.Dispatch<React.SetStateAction<string|null>>
    friendId: string | null
}

interface MessageToSendType {
    content: string
    tempId: string
    status: MessageState
}

export  const   useChatInput = ({convId, setMessages, setSelectedFriendId, friendId}: ChatInputPorps) => {

    const   MAX_LENGHT = 10;

    const   [messageErrors, setMessageErrors] = useState<Record<string, string> | null>(null);
    const   [input, setInput] = useState<string>('');
    const   [isTyping, setIsTyping] = useState<boolean>(false);
    const   typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const   {user} = useAuth();


    const   handleSendMessage = async (event: React.SyntheticEvent) => {
        if(user === null || convId === null)
        {
            window.location.reload();
            return;
        }
        event.preventDefault();
        if (isTyping && friendId && convId) { // stoping typing on send message
            clearTimeout(typingTimerRef.current);
            chatSocket.emit('typing:stop', {
                friendId,
                userId: user?.id,
                convId: String(convId)
            });
            setIsTyping(false);
        }
        const   message: string = input.trim();
        if(message === '') {
            setMessageErrors({'error': 'message cannot be empty'});
            console.log('message cannot be empty');
            setInput('');
            return ;
        }
        if(/[<>]/.test(message)) {
            setMessageErrors({'error': `HTML tags not allowed`});
            console.log('Message too long');
            return;
        }
        if(message.length > MAX_LENGHT)
        {
            setMessageErrors({'error': `message too long (max: ${MAX_LENGHT} character)`});
            console.log(`message too long (max: ${MAX_LENGHT} character)`);
            return;
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
            const   response = await fetch((import.meta.env.VITE_CHAT_API as string ?? 'http://localhost:80/api') + `/chat/conversations/${convId}/message`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageToSend)
            });
            const result = await response.json();
            if(!response.ok){
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
                setSelectedFriendId(null);
                setInput('');
                return ;
            }
            setMessages(prev => {// i update the new message to it's correspond status and id and created_at feom server
            
                const exists = prev.some(m => m.tempId === messageToSend.tempId);// Check if our message is still in the current list (User hasn't switched conv)
                if (!exists) 
                    return prev; 
                return prev.map(m => 
                    m.tempId === messageToSend.tempId 
                    ? { 
                        ...m, 
                        id: result.data.id, 
                        created_at: result.data.created_at, 
                        status: result.data.status ?? 'sent' 
                    } 
                    : m
                );
            });
        } catch (err:any) {
            console.log(err);
            setSelectedFriendId(null);
            setMessages(prev => prev.map(m => m.tempId === messageToSend.tempId ? {...m, status: 'error'} : m ));
        }
        setInput('');
    }

    /**  _____________ Handle input change : typing indicator ___________  */
    const   handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(user === null || convId === null || friendId === null)
            return ;
        const   messageValue: string = e.target.value;
        setInput(messageValue);

        if (messageValue.length === 0) { // if field is cleared we emit stop typing 
            if (isTyping) {
                chatSocket.emit('typing:stop', {
                    friendId,
                    userId: user.id,
                    convId: String(convId)
                });
                setIsTyping(false);
            }
            clearTimeout(typingTimerRef.current);
            return;
        }
        if (!isTyping && messageValue.length > 0) { // emit the event just if the first event finish
            chatSocket.emit('typing:start', {
                friendId,
                userId: user.id,
                convId: String(convId)
            });
            setIsTyping(true);
        }
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            chatSocket.emit('typing:stop', {
                friendId,
                userId: user.id,
                convId: String(convId)
            });
            setIsTyping(false);
        }, 1500);

    }

    useEffect(() => {
    return () => {
        // when switching conversation or component unmount, stop typing and clear timeout
        clearTimeout(typingTimerRef.current);
        if (isTyping && friendId && convId && user) {
            chatSocket.emit('typing:stop', {
                friendId,
                userId: user.id,
                convId: String(convId)
            });
        }
    };
}, [convId, friendId])
/************************************************************************************ */
    return {
        handleChange,
        handleSendMessage,
        input,
        messageErrors
    };

}