

export function Chat() {
  return (
    <main className="h-full flex p-4 gap-4 overflow-hidden container mx-auto maximum-w-7xl">
      
      {/* LEFT CARD: Conversation List */}
      <aside className="w-1/3 md:w-80 flex flex-col bg-slate-800 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl">
        {/* Header for the list */}
        <div className="pb-4 mb-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          {/* We will add a Search Input here later */}
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="text-slate-400 text-sm">Conversation list goes here...</p>
        </div>
      </aside>

        {/* RIGHT CARD: Chat Window */}
      <section className="flex-1 flex flex-col bg-slate-800 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
        
        <header className="p-4 border-b border-slate-700/50 bg-slate-800/50">
          <h3 className="text-lg font-semibold text-white">Select a conversation</h3>
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-slate-400 text-sm flex h-full items-center justify-center">
            Your chat history will appear here...
          </p>
        </div>

        <footer className="p-4 border-t border-slate-700/50 bg-slate-800/50">
          <p className="text-slate-400 text-sm">Input field will go here...</p>
        </footer>

      </section>
    </main>
  );
}
