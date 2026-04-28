import { useEffect } from 'react';
import  {chatSocket}  from    '../../../../socket/sock';
import type { MessageItem } from '../../../pages/Chat';
import  {useAuth}   from    '../../../../auth/useAuth';
// import { translateToBigInt } from '../../../utils/translator';

interface   UseChatSocketProps {
    convId: bigint | null
    setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>
    setIsTyping: React.Dispatch<React.SetStateAction<boolean> >
}

export interface JoinChatInf {
    room_id: string
    convId: bigint
    userId: string
}

export  const   useChatSocket = ({convId, setMessages, setIsTyping}: UseChatSocketProps) => {
    const   { user } = useAuth();
    useEffect(() => {
        if(user === null || !chatSocket.connected)
            return ;
 
        const ROM_ID: string | null = `ROOM_${convId}`;
        if (chatSocket.connected && convId !== null) {
            console.log('Joinning Chat ID:', ROM_ID);
            chatSocket.emit('join-chat', {room_id: ROM_ID, convId: convId, userId: user?.id} as JoinChatInf);
        }

        const onReceiveMessage = (newMessage: MessageItem) => {

            if(newMessage.convId && newMessage.convId !== convId) {
                return;
            }
            setMessages(prev => {
                const isPendingOnThisScreen = prev.find(mssg => mssg.tempId === newMessage.tempId);
                // if that message on my current screen with pending stats
                if (isPendingOnThisScreen)
                { 
                    return prev.map(m => 
                        m.tempId === newMessage.tempId 
                        ? { ...newMessage, status: 'sent' } 
                        : m
                    );
                }
                if (prev.find(m => String(m.id) === String(newMessage.id))) // to prevent dup, only append if not already there.
                    return prev;
                const finalMessage = { // if that message is not on my current screen, it can come from another tab or from friend
                    ...newMessage, 
                    status: newMessage.User.id === user.id ? 'sent' : null 
                };
                return [...prev, finalMessage];
            });
        }
        
        /************************************ */
        const   onTypingStart = (data: {convId: string}) => {
            if(String(convId) !== data.convId)
                return ;
            setIsTyping(true);
            console.log('its typinggg:', data);
        }
        const   onTypingStop = (data: {convId: string}) => {
            if(String(convId) !== data.convId)
                return ;
            setIsTyping(false);
            console.log('its typinggg:', data);
        }
        /************************************************* */
        // chatSocket.on('notification:new_message', () => );
        chatSocket.on('message:new', onReceiveMessage)
        chatSocket.on('typing:start', onTypingStart);
        chatSocket.on('typing:stop', onTypingStop);
        /************************************************* */
        chatSocket.on('connect_error', (err: any) => console.error('SOCKET connect_error', err));
        chatSocket.on('connect_timeout', (t) => console.error('SOCKET connect_timeout', t));
        chatSocket.on('error', (err) => console.error('SOCKET error', err));
        chatSocket.on('reconnect_attempt', (n) => console.log('SOCKET reconnect_attempt', n));
        chatSocket.on('reconnect_failed', () => console.error('SOCKET reconnect_failed'));
        return (() => {
            chatSocket.emit('leave:conversation', ROM_ID);
            chatSocket.off('typing:start', onTypingStart);
            chatSocket.off('typing:stop', onTypingStop);
            setIsTyping(false);
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