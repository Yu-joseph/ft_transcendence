import { useEffect, useState } from "react";
import type { ConversationType } from "../../../types/conversation.types";
import { fetchClient } from "../../../utils/fetchClient";
import { chatSocket } from "../../../../socket/sock";

interface UpdatedConversationEvent {
  lastMessage: {
    id: number,
    created_at: Date,
    content: string,
    senderId: string
  }
  updated_at: Date
  convId: bigint
}

export  function useConversationList(friendId: string | null){
    const   [conversationList, setConversationList] = useState<ConversationType[]>([]);
    const   [error, setError] = useState<Error | null>(null);
    const   [loading, setLoading] = useState<boolean>(false);

    /**____________ Hooks __________ */
    useEffect(() => {
        const loadConversation = async () => {
            try {
                setError(null);
                setLoading(false);
                const result : ConversationType[] = await fetchClient('/chat/conversations', {});
                setConversationList(result ?? []);
            } catch (error: any) {
                setError(error);
                setConversationList([]);
                console.log(error);
            } finally {
                setLoading(true);
            }
        };
        loadConversation();
    }, [friendId])

    /**__________ Socket Event For Updating Conversation List Order ________ */

    useEffect(() => {
        const onConversationUpdate = (updatedData: UpdatedConversationEvent) => {
        console.log("in Conversation Updated event");
        const convIdNum = Number(updatedData.convId);

        setConversationList(prev => {
            const updatedList = prev.map( conv => {
            if(conv.id != convIdNum)
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
  }, [])
  /**____________________________________________________ */
  return {
    conversationList,
    error,
    loading
  }

}