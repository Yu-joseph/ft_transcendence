import  { Ban, UserCheck }   from 'lucide-react';
import { useBlockedFriend } from './hooks/useBlockedFriend';
import { ErrorMessage, type TypeOfError } from '../shared/ErrorMessage';

export  function BlockedFriend() {
    /**_________ My Custom Hook ________ */
    const   {
        handleUnblock,
        blocked,
        loading,
        error,
        status
    } = useBlockedFriend();
    /**___________ Component-Style _______________ */
    const   type: TypeOfError = 'rejected requests';
    /**________________________________________________________________________________________________ */
    return (
        <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-6 lg:p-6">
            <div className="mb-6">
                <h1 className='text-white font-bold text-3xl flex items-center gap-3'>
                    <Ban className='text-red-500' size={32}/>
                    Rejected Users
                </h1>
                <p className='text-slate-400'>Users you have rejected friend requests from.</p>
            </div>
            <div className='flex flex-col gap-4 max-w-3xl mx-auto w-full'>
                {
                    loading && (
                        [1,2,3,4].map(i => (
                        <div key={i}
                            className='flex items-center justify-between bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 animate-pulse'
                        >
                            <div className='flex items-center gap-5'>
                                <div className='w-14 h-14 rounded-full bg-slate-700/30'></div>
                                <div className='bg-slate-700/40 h-5 w-24 rounded-full'></div>
                            </div>
                            <div className='bg-slate-700/30 w-24 h-10 rounded-xl'></div>
                    </div>)))
                }
                {
                    !loading && error && (<ErrorMessage message={error ?? null} typeOfError={type} />)
                }
                { !loading && !error &&
                blocked.map((user) => (
                    <div key={user.id} className='group flex flex-col sm:flex-row items-center justify-between bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-slate-800/60 hover:border-white/10 shadow-lg'>
                        <div className='flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0'>
                            <div className='shrink-0 w-14 h-14 rounded-full p-0.5 bg-linear-to-br from-rose-500/20 to-purple-500/20'>
                                <img
                                    src={`${user.avatar}`}
                                    alt={user.username}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <span className='text-slate-100 font-bold text-lg tracking-tight'>{user.username}</span>
                        </div>
                        <button 
                            className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500 hover:text-white transition-all duration-300 text-sm font-bold active:scale-95'
                            onClick={() => handleUnblock(user.username)} 
                            >
                            <UserCheck size={18}/>
                            Unblock
                        </button>
                    </div>
                ))}
                {!loading && !error && blocked.length === 0 && (
                    <div className='flex flex-col items-center justify-center h-80 text-center opacity-40'>
                        <div className="p-6 rounded-full bg-slate-800/50 mb-4">
                            <Ban size={48} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight">You haven't blocked anyone</p>
                    </div>  
                )}
            </div>
            {status && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-bold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 ${status?.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'}`}>
                    {status?.message}
                </div>
            )}
        </div>
    );
}