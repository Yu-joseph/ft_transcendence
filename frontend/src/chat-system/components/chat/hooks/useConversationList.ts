import { useEffect, useState } from "react";
import type { ConversationType } from "../../../types/conversation.types";
import { fetchClient } from "../../../utils/fetchClient";
import { chatSocket } from "../../../../socket/sock";
import { useRefresh } from "../../shared/useRefresh";
import { useAuth } from "../../../../auth/useAuth";
import { withMediaPrefix } from "../../shared/sharedUtils";

interface UpdatedConversationEvent {
  lastMessage: {
    id: string,
    created_at: Date,
    content: string,
    senderId: string
  }
  updated_at: Date
  convId: string
}

export  function useConversationList(friendId: string | null){
    const   [conversationList, setConversationList] = useState<ConversationType[]>([]);
    const   [error, setError] = useState<Error | null>(null);
    const   [loading, setLoading] = useState<boolean>(false);
    const   refresh = useRefresh();
    const   {user} = useAuth();
    /**____________ Hooks __________ */

    useEffect(() => {

        const   onUpdateStatus = (data: {userId: string, status: string}) => {
            setConversationList(prev => prev.map(conv => 
                conv.otherUser.id === data.userId ? {
                    ...conv, 
                    otherUser: { 
                    ...conv.otherUser, 
                    user_status: data.status 
                }
            } : conv
            ))
        }
        chatSocket.on('status:update', onUpdateStatus);
        return () => { chatSocket.off('status:update', onUpdateStatus) }
    }, [user?.id])

    /** ___________________________________________________________ */
    useEffect(() => {
        const loadConversation = async () => {
            try {
                setError(null);
                setLoading(true);
                const result : ConversationType[] = await fetchClient('/chat/conversations', {});
                if(result) {
                    result.map(conv => conv.otherUser.avatar = withMediaPrefix(conv.otherUser.avatar) ?? '');
                    setConversationList(result ?? []);
                }
            } catch (error: any) {
                setError(error);
                setConversationList([]);
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        loadConversation();
    }, [friendId, refresh, user?.id])

    /**__________ Socket Event For Updating Conversation List Order ________ */

    useEffect(() => {
        const onConversationUpdate = (updatedData: UpdatedConversationEvent) => {
            if(!updatedData.convId)
                return ;
            setConversationList(prev => {
                const updatedList = prev.map( conv => {
                if(conv.id !== updatedData.convId)
                    return conv;
                const newMessage = {
                    id: updatedData.lastMessage.id, content: updatedData.lastMessage.content, created_at: updatedData.lastMessage.created_at, senderId: updatedData.lastMessage.senderId
                };
                return {
                    ...conv,
                    lastMessage: newMessage,
                    updated_at: updatedData.updated_at
                }
                })
                return updatedList.sort((a, b) => +new Date(b.updated_at).getTime() - +new Date(a.updated_at).getTime());
            });
        };

        chatSocket.on('conversation:updated', onConversationUpdate);
        return () => {
            chatSocket.off('conversation:updated', onConversationUpdate);
        }
  }, [user?.id])
  /**____________________________________________________ */
  return {
    conversationList,
    error,
    loading
  }

}