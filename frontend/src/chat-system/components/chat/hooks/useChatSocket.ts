import React, { useEffect } from 'react';
import  {chatSocket}  from    '../../../../socket/sock';
import type { MessageItem } from '../../../pages/Chat';
import  {useAuth}   from    '../../../../auth/useAuth';

interface   UseChatSocketProps {
    convId: number | null
    setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>
    setIsTyping: React.Dispatch<React.SetStateAction<boolean> >
    
}

export interface JoinChatInf {
    room_id: string
    convId: number
    userId: string
}

export  const   useChatSocket = ({convId, setMessages, setIsTyping}: UseChatSocketProps) => {
    const   {user} = useAuth();
    useEffect(() => {
        if(user === null)
            return ;
        console.log('Use Chat socket runned again');
        console.log('ConversationId in socket effect:', convId);
        const   initSocket = async () => {
            if (!chatSocket.connected){
                chatSocket.connect();
            }
        }
        initSocket();
        const ROM_ID: string | null = `ROOM_${convId}`;
        if (chatSocket.connected && convId !== null) {

            console.log('Joinning Chat ID:', ROM_ID);
            chatSocket.emit('join-chat', {room_id: ROM_ID, convId: convId, userId: user?.id} as JoinChatInf);
        }

        const onConnect = () => {
            console.log(`I'm connected to the server ${chatSocket.id} ?? ${chatSocket.connected}`);
            if (convId === null) {
                console.log('No Conversation at now to join');
            return;
        }
            console.log('Joinning Chat ID:', ROM_ID);
            chatSocket.emit('join-chat', ROM_ID);
        }

        const onReceiveMessage = (newMessage: MessageItem) => {
            console.log('i receive this message:', newMessage);
            newMessage.status = null;
            // console.log('All Message after receiving new:', m)
            setMessages(prev => [...prev, newMessage]); // here to filter messages and update status... azka
            // chatSocket.emit('update:conversation', ROM_ID);
        }
        
        const onDisconnect = () => {
            console.log(`I'm not connected to server`);
        }
        const   onTypingStart = (data: string) => {
            setIsTyping(true);
            console.log('its typinggg:', data);
        }
        const   onTypingStop = (data: string) => {
            setIsTyping(false);
            console.log('its typinggg:', data);
        }
        /************************************************* */
        chatSocket.on('connect', onConnect);
        chatSocket.on('message:new', onReceiveMessage)
        chatSocket.on('disconnect', onDisconnect);
        chatSocket.on('typing:start', onTypingStart);
        chatSocket.on('typing:stop', onTypingStop);
        /************************************************* */
        chatSocket.on('connect_error', (err: any) => console.error('SOCKET connect_error', err));
        chatSocket.on('connect_timeout', (t) => console.error('SOCKET connect_timeout', t));
        chatSocket.on('error', (err) => console.error('SOCKET error', err));
        chatSocket.on('reconnect_attempt', (n) => console.log('SOCKET reconnect_attempt', n));
        chatSocket.on('reconnect_failed', () => console.error('SOCKET reconnect_failed'));
        return (() => {
            chatSocket.off('connect', onConnect);
            chatSocket.emit('leave:conversation', ROM_ID);

            // chatSocket.off('typing:start'), onTypingStart;
            // chatSocket.off('typing:stop'), onTypingStop;

            chatSocket.off('message:new', onReceiveMessage);
            chatSocket.off('error');
            chatSocket.off('connect_timeout');
            chatSocket.off('reconnect_attempt');
            chatSocket.off('reconnect_failed');
            chatSocket.off('connect_error');
    }

    );

  }, [convId])
}