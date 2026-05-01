import { ConversationList } from "../components/chat/ConversationList";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatMessage } from "../components/chat/ChatMessage";
import { useLocation, type Location } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchClient } from "../utils/fetchClient";
import { useChatSocket } from "../components/chat/hooks/useChatSocket";
import { useAuth } from "../../auth/useAuth";
import { chatSocket } from "../../socket/sock";

export type MessageState = 'pending' | 'sent' | 'error';

export interface MessageItem {
  convId?: string
  id: string;
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
  convId: string;
  messages: MessageItem[];
}

export function Chat() {
  const { user } = useAuth();

  const location = useLocation() as Location & { state?: { selectedFriendId?: string } };
  const friendId = location.state?.selectedFriendId as string ?? null;

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendId);
  const [isLoadedFromFriendProfile, setIsLoadedFromFriendProfile] = useState<boolean>(false);
  const [isBlocked, setIsblocked] = useState<boolean>(false); // for blocking userInput where a user block it's friend

  useEffect(() => {
    // Clear messages and reset flags when switching conversations
    setMessages([]);
    setIsLoadedFromFriendProfile(false);
    setIsblocked(false);
    setIsTyping(false);
  }, [selectedConvId, selectedFriendId]);
  /************************************* */
  useEffect(() => {
    if (!user)
      return;
    const handleFriendUpdate = (data: { senderName: string, type: string }) => {
      if (data.type === 'REMOVE') {
        console.log('You cant chat anymore with him');
        setIsblocked(true);
        if (selectedConvId) {
          chatSocket.emit('leave:conversation', `ROOM_${selectedConvId}`); // to leave the room
        }
      }
    }
    /********************** */
    chatSocket.on('notification:friend_update', handleFriendUpdate);
    return () => {
      chatSocket.off('notification:friend_update', handleFriendUpdate);
    }
  }, [user?.id])
  /** ___________ Load Messages from Conversation Id ___________ */
  useEffect(() => {
    if (user === null)
      return;
    if (selectedConvId === null || isLoadedFromFriendProfile)
      return;
    console.log('Loading History from conv Id');
    const abortController = new AbortController(); // just for aborting the request if the user switch to another conversation

    const loadHistoryByConvId = async () => {
      try {
        const result = await fetchClient<{ messages: MessageItem[], status: string } | { messages: [], status: string }>(`/chat/conversations/${selectedConvId}/messages`,
          { signal: abortController.signal });
        if (result && result.messages) {
          setIsblocked(result.status === 'NOT FRIEND' ? true : false);
          result.messages.forEach(m => { m.status = m.User.id === user.id ? 'sent' : null; });
          setMessages(result.messages);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Loading history by conv Id aborted');
          return;
        }
        setSelectedFriendId(null);
        console.error(err);
        setMessages([]); // to update to display error loading
      }
    }
    loadHistoryByConvId();
    return () => {
      abortController.abort();
    };
  }, [selectedConvId, selectedFriendId, user?.id])

  // when user come from friend profile to open chat message
  useEffect(() => {
    if (user === null)
      return;

    if (!selectedFriendId || selectedConvId)
      return;
    const abortController = new AbortController();
    console.log('Comming from friend profile');
    const loadHistoryByFriendId = async () => {
      try {
        const result = await fetchClient<MessagesWithConvId>(`/chat/friend/${selectedFriendId}/messages`,
          { signal: abortController.signal });
        if (result && result.convId) {
          setIsLoadedFromFriendProfile(true);
          result.messages.forEach(m => { m.status = m.User.id === user.id ? 'sent' : null });
          setMessages(result.messages);
          setSelectedConvId(result.convId);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Loading history by Friend Id aborted');
          return;
        }
        setSelectedFriendId(null);
        setMessages([]); // to update to display error loading
      }
    }
    loadHistoryByFriendId();
    return () => {
      abortController.abort();
    };
  }, [selectedFriendId, selectedConvId, user?.id]);

  /** ____________ SOCKET HANDLER ____________ */
  useChatSocket({ convId: selectedConvId, setMessages: setMessages, setIsTyping: setIsTyping });
  /*************************  Composnent **************************************** */
  return (
    <main className="h-full flex flex-col md:flex-row p-2 sm:p-4 gap-0 md:gap-4 overflow-hidden bg-slate-950">
      <div className={`w-full md:w-80 h-full ${selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList 
          setConvId={setSelectedConvId} 
          convId={selectedConvId} 
          selectFriendId={setSelectedFriendId} 
          friendId={selectedFriendId} 
        />
      </div>

      <section className={`flex-1 flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${selectedFriendId ? 'flex' : 'hidden md:flex'}`}>
        <ChatMessage 
          messages={messages} 
          friendId={selectedFriendId} 
          convId={selectedConvId} 
          isTyping={isTyping}
          onBack={() => {
            setSelectedFriendId(null);
            setSelectedConvId(null);
          }}
        />

        {
          selectedFriendId ? (
            !isBlocked ? (
              <ChatInput setMessages={setMessages} convId={selectedConvId} friendId={selectedFriendId} />
            ) : (
              <footer className="px-6 py-6 border-t border-white/5 bg-slate-900/60 backdrop-blur-md sticky bottom-0 z-0 flex items-center justify-center">
                <div
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl px-6 py-3 shadow-inner w-full flex justify-center text-slate-400 text-[13px] font-medium cursor-not-allowed">
                  You are no longer friends. Add them to chat again.
                </div>
              </footer>
            )
          ) : null
        }
      </section>
    </main>
  );
}
