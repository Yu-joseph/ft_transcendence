import  {IoEllipsisHorizontal} from 'react-icons/io5';
export function ChatMessage() {
    const messages = [
    { id: 1, senderId: 2, content: "Hey! How are you doing today?", created_at: new Date() },
    { id: 2, senderId: 1, content: "I'm doing great, thanks for asking! Just working on some React stuff.", created_at: new Date() },
    { id: 3, senderId: 1, content: "How about you?", created_at: new Date() },
    { id: 4, senderId: 2, content: "Same here. Grinding on a new project.", created_at: new Date() },
    { id: 5, senderId: 1, content: "Same here. Grinding on a new project.", created_at: new Date() },
    { id: 6, senderId: 2, content: "Same here. Grinding on a new project.", created_at: new Date() },
    { id: 7, senderId: 1, content: " on a new project.", created_at: new Date() },
    { id: 8, senderId: 2, content: "Same heroject.", created_at: new Date() },
    { id: 9, senderId: 2, content: "Samect.", created_at: new Date() },
    { id: 10, senderId: 1, content: " here. Grindint.", created_at: new Date() },
    { id: 11, senderId: 2, content: " here. Grinding on a new project.", created_at: new Date() },
    { id: 12, senderId: 2, content: " here. Grinding on a new project.", created_at: new Date() },
    { id: 13, senderId: 1, content: " here. Grinding on a new project.", created_at: new Date() },

    ];
    const currentUserId = 1;
    return (
        <>
            <header className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/60 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex justify-center items-center text-white font-bold shadow-md">
                            M
                        </div>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div>
                        <h3 className="text-lg text-white font-bold leading-tight">
                            mait-taj
                        </h3>
                        <p className="text-xs text-green-400 font-medium">Online</p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3">
                    <button className='w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer'>
                        <IoEllipsisHorizontal size={20}/>
                    </button>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" >
                {
                    messages.map(m => {
                        const   isMe = m.senderId === currentUserId;
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl p-3 shadow-md ${isMe ? 'bg-blue-600 text-white rounded-tr-sm border-2 border-slate-700/50' : 'bg-slate-800 text-slate-200 border-2 border-slate-700/50 rounded-tl-sm'}`}>
                                    <p className='text-sm leading-relaxed'>
                                    {m.content}
                                    </p>
                                    <div className={`text-[10px] mt-1 flex ${isMe ? 'text-blue-200 justify-end' : 'text-slate-400 justify-start'}`}>
                                        {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </>
    );
}