import React, { useEffect } from 'react';
import  {chatSocket}  from    '../../socket/sock';
import type { MessageItem } from '../pages/Chat';

interface   UseChatSocketProps {
    convId: number | null
    setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>
}

export  const   useChatSocket = ({convId, setMessages, setIsConnected}: UseChatSocketProps) => {
    useEffect(() => {
        console.log('ConversationId in socket effect:', convId);

        const   initSocket = async () => {
            if (!chatSocket.connected){
                chatSocket.connect();
                setIsConnected(true);
            }
        }
        initSocket();
        const ROM_ID: string | null = `ROOM_${convId}`;
        if (chatSocket.connected && convId !== null) {
            console.log('Joinning Chat ID:', ROM_ID);
            chatSocket.emit('join-chat', ROM_ID);
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
            setMessages(prev => [...prev, newMessage])
        }
        
        const onDisconnect = () => {
            console.log(`I'm not connected to server`);
            setIsConnected(false);
        }
        /************************************************* */
        chatSocket.on('connect', onConnect);
        chatSocket.on('message:new', onReceiveMessage)
        chatSocket.on('disconnect', onDisconnect);
        /************************************************* */
        chatSocket.on('connect_error', (err: any) => console.error('SOCKET connect_error', err));
        chatSocket.on('connect_timeout', (t) => console.error('SOCKET connect_timeout', t));
        chatSocket.on('error', (err) => console.error('SOCKET error', err));
        chatSocket.on('reconnect_attempt', (n) => console.log('SOCKET reconnect_attempt', n));
        chatSocket.on('reconnect_failed', () => console.error('SOCKET reconnect_failed'));
        return (() => {
            chatSocket.off('connect', onConnect);
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