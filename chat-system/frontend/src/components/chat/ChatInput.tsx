import  { IoSend }  from 'react-icons/io5'
export  function    ChatInput() {
    return (
        <footer className="px-6 py-4 border-t-2 border-slate-700/50 bg-slate-900/80 backdrop:blur-md sticky bottom-0 z-0">
            <div className='flex items-center gap-3'>

            </div>
            <form className='flex-1 flex items-center bg-slate-800/80 border border-slate-700/50 rounded-full pr-1.5 pl-4
                 focus-within:border-indigo-500/50 transition-all duration-200 shadow-inner'>
                <input
                    type="text"
                    className='flex-1 bg-transparent py-3 text-sm text-white placeholder:text-slate-500 outline-none'
                    placeholder='Type a message...'
                />
                <button type='submit' className='p-2 ml-2 bg-indigo-500 hover:bg-indigo-600 rounded-full flex justify-center items-center shrink-0 my-1
                                                text-white shadow-md transition-colors cursor-pointer'>
                    <IoSend size={18} className='translate-x-1'/>
                </button>
            </form>

        </footer>
    );
}