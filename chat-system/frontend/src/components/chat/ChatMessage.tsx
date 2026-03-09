export function ChatMessage() {
    return (
        <>
            <header className="p-4 border-b border-slate-700/50 bg-slate-900/60">
                <h3 className="text-lg font-semibold text-white">Select a conversation</h3>
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-slate-400 text-sm flex h-full items-center justify-center">
                Your chat history will appear here...
            </p>
            </div>
        </>
    );
}