import { ConversationList } from "../components/chat/ConversationList";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatMessage } from "../components/chat/ChatMessage";
import { useLocation, type Location } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  const friendIdFromLocation = location.state?.selectedFriendId as string ?? null;

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendIdFromLocation);
  const [isBlocked, setIsblocked] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false); //when switching conversations, this state it stop jumping

  const loadedConvIdRef = useRef<string | null>(null);
  const loadedFriendIdRef = useRef<string | null>(null);

// Sync navigation state
  const [prevLocationFriendId, setPrevLocationFriendId] = useState<string | null>(friendIdFromLocation);

  if (friendIdFromLocation !== prevLocationFriendId) {
    setPrevLocationFriendId(friendIdFromLocation);
    setSelectedFriendId(friendIdFromLocation);
    setSelectedConvId(null);
    setMessages([]);
    setIsblocked(false);
    setIsTyping(false);
  }

  // 2handle clicking conversations in the sidebar
  const handleSelectConversation = (convId: string, friendId: string) => {
    setSelectedConvId(convId);
    setSelectedFriendId(friendId);
    setMessages([]);
    setIsblocked(false);
    setIsTyping(false);
    loadedConvIdRef.current = null;
    loadedFriendIdRef.current = null;
  };

  /** Friend Update Listener */
  useEffect(() => {
    if (!user?.id)
      return;
    const handleFriendUpdate = (data: { senderName: string, type: string }) => {
      if (data.type === 'REMOVE') {
        setIsblocked(true);
        if (selectedConvId) {
          chatSocket.emit('leave:conversation', `ROOM_${selectedConvId}`);
        }
      }
    }
    chatSocket.on('notification:friend_update', handleFriendUpdate);
    return () => {
      chatSocket.off('notification:friend_update', handleFriendUpdate);
    }
  }, [user?.id, selectedConvId]);


  /** ____________ Fetch History ________________ */

  useEffect(() => {
    if (!user?.id)
      return;

    // If we have already fully loaded this conversation/friend, do nothing to prevent races
    if (selectedConvId && loadedConvIdRef.current === selectedConvId)
      return;
    if (!selectedConvId && selectedFriendId && loadedFriendIdRef.current === selectedFriendId)
      return;

    if (!selectedConvId && !selectedFriendId)
      return;

    const abortController = new AbortController();

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        if (selectedConvId) {
          setMessages([]);
          console.log('Loading History from conv Id');
          const result = await fetchClient<{ messages: MessageItem[], status: string }>(
            `/chat/conversations/${selectedConvId}/messages`,
            { signal: abortController.signal }
          );
          if (result && result.messages) {
            setIsblocked(result.status === 'NOT FRIEND');
            result.messages.forEach(m => { m.status = m.User.id === user.id ? 'sent' : null; });
            setMessages(prev => {
              // Filter out duplicates mess in case history and live stream overlapped
              const existingIds = new Set(prev.map(m => m.id));
              const newHistory = result.messages.filter(m => !existingIds.has(m.id));
              return [...newHistory, ...prev]; 
            });
            loadedConvIdRef.current = selectedConvId; // Mark as loaded
          }
        } else if (selectedFriendId) {
          setMessages([]);
          console.log('Loading History from friend profile');
          const result = await fetchClient<MessagesWithConvId>(
            `/chat/friend/${selectedFriendId}/messages`,
            { signal: abortController.signal }
          );
          if (result && result.convId) {
            result.messages.forEach(m => { m.status = m.User.id === user.id ? 'sent' : null; });
            setMessages(prev => {
              // Filter out duplicates mess in case history and live stream overlapped
              const existingIds = new Set(prev.map(m => m.id));
              const newHistory = result.messages.filter(m => !existingIds.has(m.id));
              return [...newHistory, ...prev]; 
            });
            loadedConvIdRef.current = result.convId; // Mark as loaded
            loadedFriendIdRef.current = selectedFriendId;
            setSelectedConvId(result.convId);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setMessages([]);
        if (!selectedConvId)
          setSelectedFriendId(null);
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
    return () => abortController.abort();
  }, [selectedConvId, selectedFriendId, user?.id]);

  /** ____________ SOCKET HANDLER ____________ */
  useChatSocket({ convId: selectedConvId, setMessages: setMessages, setIsTyping: setIsTyping });
  /*************************  Composnent **************************************** */
  return (
    <main className="h-full flex flex-col md:flex-row p-2 sm:p-4 gap-0 md:gap-4 overflow-hidden bg-slate-950">
      <div className={`w-full md:w-80 h-full ${selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          convId={selectedConvId}
          friendId={selectedFriendId}
        />
      </div>

      <section className={`flex-1 flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${selectedFriendId ? 'flex' : 'hidden md:flex'}`}>
        <ChatMessage
          messages={messages}
          friendId={selectedFriendId}
          convId={selectedConvId}
          isTyping={isTyping}
          isLoading={isLoadingHistory}
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
