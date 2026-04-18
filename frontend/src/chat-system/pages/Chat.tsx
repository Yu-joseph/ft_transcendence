import { ConversationList } from "../components/chat/ConversationList";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatMessage } from "../components/chat/ChatMessage";
import { useLocation, type Location } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchClient } from "../utils/fetchClient";
import { useChatSocket } from "../components/chat/hooks/useChatSocket";
import { useAuth } from "../../auth/useAuth";

export type MessageState = 'pending' | 'sent' | 'error';

export interface MessageItem {
  id: number | string;
  content: string;
  User: {
    id: string;
    username: string;
  };
  created_at: string;
  status: MessageState | null
  tempId: string | null
}
export interface MessagesWithConvId {
  convId: number;
  messages: MessageItem[];
}

export function Chat() {
  const {user} = useAuth();

  const location = useLocation() as Location & { state?: { selectedFriendId?: string } };
  const friendId = location.state?.selectedFriendId as string ?? null;

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendId);
  const [isLoadedFromFriendProfile, setIsLoadedFromFriendProfile] = useState<boolean>(false);

  useEffect(() => {
    if(user === null) return ;
    if (selectedConvId === null || isLoadedFromFriendProfile)
      return;
    console.log('Loading History from conv Id');
    const loadHistoryByConvId = async () => {
      try {
        const result = await fetchClient<MessageItem[] | []>(`/chat/conversations/${selectedConvId}/messages`, {});
        result.forEach(m => {m.status = m.User.id === user.id ? 'sent' : null; });
        setMessages(result);
      } catch (err: any) {
        setSelectedFriendId(null);
        console.log(err);
        setMessages([]); // to update to display error loading
      }
    }
    loadHistoryByConvId();
  }, [selectedConvId, selectedFriendId, user])

  // when user come from friend profile to open chat message
  useEffect(() => {
    if(user === null) return ;

    if (!selectedFriendId || selectedConvId)
      return;
    console.log('Comming from friend profile');
    const loadHistoryByFriendId = async () => {
      try {
        const result = await fetchClient<MessagesWithConvId>(`/chat/friend/${selectedFriendId}/messages`, {});
        console.log(result);
        setIsLoadedFromFriendProfile(true);
        result.messages.forEach(m => {m.status = m.User.id === user.id ? 'sent' : null});
        setMessages(result.messages);
        setSelectedConvId(result.convId);
      } catch (err: any) {
        console.log(err);
        setSelectedFriendId(null);
        setMessages([]); // to update to display error loading
      }
    }
    loadHistoryByFriendId();
  }, [selectedFriendId, selectedConvId, user])

  /** ____________ SOCKET HANDLER ____________ */
  useChatSocket({convId: selectedConvId, setMessages: setMessages, setIsTyping: setIsTyping });
  /*************************  Composnent **************************************** */
  return (
    <main className="h-full flex p-4 gap-4 overflow-hidden container mx-auto maximum-w-7xl">
      <ConversationList setConvId={setSelectedConvId} convId={selectedConvId} selectFriendId={setSelectedFriendId} />
      <section className="flex-1 flex flex-col bg-slate-800 border border-blue-700 rounded-2xl shadow-xl overflow-hidden hover:border-amber-500 hover:scale-101 transition-all duration-300">
        <ChatMessage messages={messages} friendId={selectedFriendId} convId={selectedConvId} isTyping={isTyping} />
        <ChatInput setMessages={setMessages} convId={selectedConvId} setSelectedFriendId={setSelectedFriendId} />
      </section>
    </main>
  );
}
