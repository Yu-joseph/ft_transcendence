import { IoSend } from 'react-icons/io5';
import { useChatInput, type ChatInputPorps } from './hooks/useChatInput';

export function ChatInput({ setMessages, convId, friendId }: ChatInputPorps) {

    const { handleChange, handleSendMessage, input, messageErrors } = useChatInput({ convId, setMessages, friendId });

    if (!convId)
        return <div className='h-0 w-0'></div>
    return (
        <footer className="px-4 py-3 md:px-6 md:py-4 border-t border-white/5 bg-slate-900/60 backdrop-blur-md sticky bottom-0 z-10 shrink-0">
            {messageErrors && (
                <div id='message-error' role='alert'
                    className='text-rose-400 px-2 pb-2 text-[13px] font-medium'>
                    {messageErrors.error}
                </div>
            )}
            <form
                onSubmit={handleSendMessage}
                className='flex items-center gap-2'>
                <div className='flex-1 relative'>
                    <input
                        type="text"
                        onChange={handleChange}
                        value={input}
                        className='w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl py-3 pl-4 pr-4 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all shadow-inner'
                        placeholder='Type a message...'
                    />
                </div>
                <button 
                    type='submit' 
                    disabled={!input.trim()}
                    className='w-11 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl flex justify-center items-center shrink-0 text-white transition-all cursor-pointer'>
                    <IoSend size={18} className='translate-x-0.5' />
                </button>
            </form>
        </footer>
    );
}