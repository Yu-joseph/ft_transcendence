export  function ConversationList() {
    return (
        <aside className="w-1/3 md:w-80 flex flex-col bg-slate-800 backdrop-blur-md border border-blue-700 rounded-2xl p-4 shadow-xl hover:border-amber-500 hover:scale-101 transition-all duration-300">

        <div className="pb-4 mb-4 border-b-amber-50 border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Messages</h2>

        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="text-slate-400 text-sm">Conversation list go here...</p>
        </div>
      </aside>
    );
}