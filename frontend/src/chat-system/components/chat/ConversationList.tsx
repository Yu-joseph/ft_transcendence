import { useConversationList } from "./hooks/useConversationList";
import { ErrorMessage, type TypeOfError } from "../shared/ErrorMessage";
import { useNavigate } from "react-router-dom";

interface ConversationListProps {
  setConvId: React.Dispatch<React.SetStateAction<string | null>>;
  convId: string | null
  selectFriendId: React.Dispatch<React.SetStateAction<string | null>>
  friendId: string|null
}

export  function ConversationList({setConvId, convId, selectFriendId, friendId}: ConversationListProps ) {
  /**______ Costume Hooks _______________ */
  const {loading, error, conversationList} = useConversationList(friendId);
  const navigate = useNavigate();

  /**________ Component-Style __________________ */
    if (loading) {
    return (
      <aside className="w-1/3 md:w-80 flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-xl">
        <div className="pb-2 mb-2">
          <h2 className="text-xl font-bold text-white">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-slate-800">
          <ul className="space-y-2 mt-2 flex-1 pr-2">
            {/* Create an array of 6 items to show a list of fake loading components */}
            {[1, 2, 3, 4, 5].map((item) => (
              <li key={item} className="flex items-center gap-4 p-3 rounded-3xl">
                {/* Avatar Skeleton */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-700 animate-pulse"></div>
                </div>
                
                {/* Lines Skeleton */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between item-baseline mb-2">
                    {/* Username placeholder */}
                    <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                    {/* Time placeholder */}
                    <div className="h-3 w-8 bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  {/* Message body placeholder */}
                  <div className="h-3 w-3/4 bg-slate-700 rounded animate-pulse mt-1"></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  }
 if (error) {
    const type: TypeOfError = 'conversations';
   return <ErrorMessage message={error.message ?? null} typeOfError={type} />
 }

    return (
        <aside className="w-1/3  md:w-80 flex flex-col bg-slate-900/60 backdrop-blur-md border border-blue-700 rounded-2xl p-4 shadow-xl hover:border-amber-500 hover:scale-101 transition-all duration-300">

        <div className="pb-2 mb-2">
          <h2 className="text-xl font-bold text-white" >Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-800">
          <ul className="space-y-2 mt-2 flex-1 overflow-y-auto no-scrollbar pr-2">
          {conversationList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
              <div className="p-4 bg-slate-700/20 rounded-full">
                {/* A simple message icon */}
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-slate-200 font-medium">No messages yet</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Start a conversation with one of your friends to see it here.
                </p>
              </div>
              <button 
                onClick={() => navigate('/Friends')}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Find Friends →
              </button>
            </div>
          ) : (
            conversationList.map((conv) => (
              <li
              onClick={() => {
                setConvId(conv.id);
                selectFriendId(conv.otherUser.id as string);
              }}
              key={conv.id}
              className={`${convId === conv.id ? 'bg-slate-700/30' : ''} group flex items-center gap-4 p-3 rounded-3xl cursor-pointer hover:bg-slate-700/40 transition-all duration-200 border border-transparent hover:border-slate-600/50`}>
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-50 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        <img
                            src={`${conv.otherUser.avatar}`}
                            alt="User Avatar"
                            className="w-full h-full object-cover rounded-full flex items-center justify-center"
                        />
                      </div>
                      {/* user status */}
                      <div className={`absolute w-3 h-3 bottom-0 right-0 ${conv.otherUser.user_status === 'Online' ? 'bg-green-500' : 'bg-slate-500'} rounded-full border-2 border-slate-800`}></div>
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
            )}
            
            
            
          </ul>
        </div>
      </aside>
    );
}