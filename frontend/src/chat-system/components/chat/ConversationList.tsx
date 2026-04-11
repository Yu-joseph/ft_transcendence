import React, { useEffect, useState } from "react";
import { fetchClient } from "../../utils/fetchClient";

interface ConversationListProps {
  setConvId: React.Dispatch<React.SetStateAction<number | null>>;
  convId: number | null
  selectFriendId: React.Dispatch<React.SetStateAction<string | null>>
  deletedConvId: number | null;
}

interface   ConversationType {
    /**
     * @description return-type of existing Conversation
    */
   id: number
   otherUser: {
        id: string,
        username: string,
        avatar: string | null
    }
    lastMessage: {
        id: number,
        created_at: Date,
        content: string,
        senderId: string
    } | null
    updated_at: Date
}

export  function ConversationList({setConvId, convId, selectFriendId, deletedConvId}: ConversationListProps ) {
  const [conversationLists, setConversationList] = useState<ConversationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error| null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        setError(null);
        setLoading(false);
        const result : ConversationType[] = await fetchClient('/chat/conversations', {});
        setConversationList(result);
      } catch (error: any) {
        setError(error);
        setConversationList([]);
        console.log(error);
      } finally {
        setLoading(true);
      }
    };
    loadConversation();
  }, [])

  /****** Updated deleted Conv Id */
  useEffect(() => {
    setConversationList(prev => prev.filter(conv => conv.id !== deletedConvId))
  }, [deletedConvId])

  if(!loading)
    return <div className="text-slate-500 flex items-center justify-center h-full">Loading...</div>
  if (error)
    return <div className="text-slate-500 flex items-center justify-center h-full">{error?.message ? `Error: ${error.message}` : 'an error occured'}</div>

    return (
        <aside className="w-1/3  md:w-80 flex flex-col bg-slate-900/60 backdrop-blur-md border border-blue-700 rounded-2xl p-4 shadow-xl hover:border-amber-500 hover:scale-101 transition-all duration-300">

        <div className="pb-2 mb-2">
          <h2 className="text-xl font-bold text-white" >Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-800">
          <ul className="space-y-2 mt-2 flex-1 overflow-y-auto no-scrollbar pr-2">
            {
              conversationLists.map((conv) => (
                <li
                  onClick={() => {
                    setConvId(conv.id);
                    selectFriendId(conv.otherUser.id);
                  }}
                  key={conv.id}
                  className={`${convId === conv.id ? 'bg-slate-700/30' : ''} group flex items-center gap-4 p-3 rounded-3xl cursor-pointer hover:bg-slate-700/40 transition-all duration-200 border border-transparent hover:border-slate-600/50`}>
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-50 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {conv.otherUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between item-baseline mb-1">
                        <h3 className="text-slate-100 font-semibold truncate pr-2 group-hover:text-indigo-400 transition-colors">
                          {conv.otherUser.username}
                        </h3>
                        <span className="text-xs text-slate-400 shrink-0">
                          {conv.lastMessage?.created_at && new Date(conv.lastMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) }
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-sm text-slate-400 truncate">
                          {conv.lastMessage?.content || 'No message yet'}
                        </p>
                      </div>
                    </div>
                </li>
              ))
            }
          </ul>
        </div>
      </aside>
    );
}