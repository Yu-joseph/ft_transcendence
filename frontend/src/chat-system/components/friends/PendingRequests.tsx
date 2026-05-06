import  { Check, Clock, Users, UserSearch, X }    from    'lucide-react';
import { usePendingRequest } from './hooks/usePendingRequest';
import { ErrorMessage, type TypeOfError } from '../shared/ErrorMessage';

export  function    PendingRequests() {
    /**________ Costum Hook __________ */
    const   {
        handleAccept,
        handleCancel,
        handleReject,
        pendingFriend,
        loading,
        error,
        actionError,
        clearActionError,
    } = usePendingRequest();
    /**_______________ Component-Style ___________________ */
    const   type: TypeOfError = 'pending requests';
    return (
        <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-6 lg:p-6">
            <div className='mb-6 ml-2'>
                <h1 className='text-3xl font-bold flex items-center gap-3 text-white'>
                    <UserSearch className='text-emerald-400' size={32}/>
                    Pending Requests
                </h1>
                <p className='mt-1 text-slate-400'>Manage your incoming and outgoing friend requests.</p>
            </div>
            {/* /************************************** */ }
            {actionError && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{actionError}</span>
                    <button
                        onClick={clearActionError}
                        className="text-rose-200 hover:text-white transition-colors"
                        aria-label="Dismiss error"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* / ******************************************************* */ }
            <div className='flex flex-col gap-4 max-w-3xl mx-auto w-full'>
                {
                    loading && (
                        [1,2,3,4].map(i => (
                        <div key={i}
                            className='flex items-center justify-between bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 animate-pulse'
                        >
                            <div className='flex items-center gap-5'>
                                <div className='w-14 h-14 rounded-full bg-slate-700/30'></div>
                                <div className='flex flex-col gap-2'>
                                    <div className='bg-slate-700/40 h-5 w-24 rounded-full'></div>
                                    <div className='bg-slate-700/20 h-3 w-32 rounded-full'></div>
                                </div>
                            </div>
                            <div className='bg-slate-700/30 w-24 h-10 rounded-xl'></div>
                    </div>)))
                }
                {
                    !loading && error && (<ErrorMessage message={error ?? null} typeOfError={type} />)
                }
                { !loading &&
                    !error &&
                    pendingFriend
                    .filter(p => !(p.status === 'REJECTED' && p.type === 'incoming'))
                    .map((penFr) => (
                    <div key={penFr.friendRequestId}
                        className='group flex flex-col sm:flex-row items-center justify-between bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-slate-800/60 hover:border-white/10 shadow-lg'
                    >
                        <div className='flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0'>
                            <div className='relative shrink-0'>
                                <div className='w-14 h-14 rounded-full p-0.5 bg-linear-to-br from-indigo-500/30 to-purple-500/30'>
                                    <img
                                        src={`${penFr.userInfo.avatar}`}
                                        alt={penFr.userInfo.username}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-white/5`}>
                                    {penFr.type === 'incoming' ? <Clock size={12} className="text-amber-400" /> : <Users size={12} className="text-indigo-400" />}
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-slate-100 font-bold text-lg tracking-tight'>{penFr.userInfo.username}</span>
                                <span className='text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5'>
                                    {penFr.type === 'incoming' ? 'Incoming Request' : 'Sent Request'}
                                </span>
                            </div>
                        </div>

                        {
                            penFr.type === 'incoming' ? (
                                <div className='flex items-center gap-3 w-full sm:w-auto justify-end'>
                                    <button
                                        onClick={() => handleAccept(penFr.friendRequestId)}
                                        className='flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all duration-300 font-bold text-sm shadow-lg shadow-emerald-500/10 active:scale-95'>
                                        <Check size={18}/>
                                        <span>Accept</span>
                                    </button>
                                    <button
                                        onClick={() => handleReject(penFr.friendRequestId)}
                                        className='p-2.5 rounded-xl bg-slate-700/30 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-300' title='Decline'>
                                        <X size={18}/>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleCancel(penFr.friendRequestId)}
                                    className='w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-300 font-bold text-sm shadow-lg shadow-rose-500/10 active:scale-95'>
                                    Cancel Request
                                </button>
                            )
                        }
                    </div>
                ))}
            </div>
            {pendingFriend.length === 0 && !loading && !error && (
                <div className="flex flex-col items-center justify-center h-80 text-center opacity-40">
                    <div className="p-6 rounded-full bg-slate-800/50 mb-4">
                        <UserSearch size={48} className="text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">No pending requests right now</p>
                </div>
            )}
        </div>
    );
}