import { ConversationList } from "../components/chat/ConversationList";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatMessage } from "../components/chat/ChatMessage";
import { useLocation, type Location } from "react-router-dom";
import { useEffect, useState } from "react";

import { fetchClient } from "../utils/fetchClient";

import { useChatSocket } from "../hooks/useChatSocket";

export interface MessageItem {
  id: number;
  content: string;
  User: {
    id: string;
    username: string;
  };
  created_at: string;
}
export interface MessagesWithConvId {
  convId: number;
  messages: MessageItem[];
}

export function Chat() {

  const location = useLocation() as Location & { state?: { selectedFriendId?: string } };
  const friendId = location.state?.selectedFriendId as string ?? null;

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendId);
  const [isLoadedFromFriendProfile, setIsLoadedFromFriendProfile] = useState<boolean>(false);
  const [deletedConversation, setDeletedConversation] = useState<number | null>(null);

  useEffect(() => {
    if (selectedConvId === null || isLoadedFromFriendProfile)
      return;
    const loadHistoryByConvId = async () => {
      try {
        const result = await fetchClient<MessageItem[] | []>(`/chat/conversations/${selectedConvId}/messages`, {});
        setMessages(result);
      } catch (err: any) {
        console.log(err);
        setMessages([]);
      }
    }
    loadHistoryByConvId();
  }, [selectedConvId])

  // when user come from friend profile to open chat message
  useEffect(() => {
    if (!selectedFriendId || selectedConvId)
      return;
    console.log('Comming from friend profile');
    const loadHistoryByFriendId = async () => {
      try {
        const result = await fetchClient<MessagesWithConvId>(`/chat/friend/${selectedFriendId}/messages`, {});
        console.log(result);
        setIsLoadedFromFriendProfile(true);
        setMessages(result.messages);
        setSelectedConvId(result.convId);
      } catch (err: any) {
        console.log(err);
        setMessages([]);
      }
    }
    loadHistoryByFriendId();
  }, [selectedFriendId])

  /** ____________ SOCKET HANDLER ____________ */
  useChatSocket({convId: selectedConvId, setMessages: setMessages, setIsTyping:setIsTyping });
  return (
    <main className="h-full flex p-4 gap-4 overflow-hidden container mx-auto maximum-w-7xl">
      <ConversationList setConvId={setSelectedConvId} convId={selectedConvId} selectFriendId={setSelectedFriendId} deletedConvId={deletedConversation} />
      <section className="flex-1 flex flex-col bg-slate-800 border border-blue-700 rounded-2xl shadow-xl overflow-hidden hover:border-amber-500 hover:scale-101 transition-all duration-300">
        <ChatMessage messages={messages} friendId={selectedFriendId} convId={selectedConvId} setConvId={setSelectedConvId} setFriendId={setSelectedFriendId} setDeletedConv={setDeletedConversation} isTyping={isTyping} />
        <ChatInput setMessages={setMessages} convId={selectedConvId} />
      </section>
    </main>
  );
}
