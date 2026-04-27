import  { Check, UserSearch, X }    from    'lucide-react';
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
        error
    } = usePendingRequest();
    /**_______________ Component-Style ___________________ */
    const   type: TypeOfError = 'pending requests';
    return (
        <div className="flex flex-col w-full">
            <div className='mb-6 ml-2'>
                <h1 className='text-3xl font-bold flex items-center gap-3 text-white'>
                    <UserSearch className='text-emerald-400' size={32}/>
                    Pending Requests
                </h1>
                <p className='mt-1 text-slate-400'>Manage your incoming and outgoing friend requests.</p>
            </div>
            {/* / ******************************************************* */ }
            <div className='flex flex-col gap-4'>length
                {
                    loading && (
                        [1,2,3,4,5].map(i => (
                        <div key={i}
                            className='flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 animate-pulse'
                        >
                            <div className='flex items-center gap-4'>
                                <div className='w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center'></div>
                                <div className='flex flex-col'>
                                    <span className='rounded-2xl bg-slate-700/40 h-6 w-20'></span>
                                    <span className='rounded-2xl bg-slate-700/30 mt-2 h-3'></span>
                                </div>
                            </div>
                            <div className='bg-slate-700/40 w-20 h-7 rounded-full'></div>
                    </div>)))
                }
                {
                    !loading && error && (<ErrorMessage message={error ?? null} typeOfError={type} />)
                }
                { !loading && !error &&
                pendingFriend
                    .filter(p => !(p.status === 'REJECTED' && p.type === 'incoming'))
                    .map((penFr) => (
                    <div key={penFr.friendRequestId}
                        className='flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all hover:bg-slate-800/60'
                    >
                        <div className='flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center
                            text-white font-bold text-xl shadow-inner'>
                            <img
                                src={`${penFr.userInfo.avatar}`}
                                alt="User Avatar"
                                className="w-full h-full object-cover rounded-full flex items-center justify-center"
                            />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-white font-medium text-lg'>{penFr.userInfo.username}</span>
                                <span className='text-sm text-slate-400'>{penFr.type === 'incoming' ? 'Incoming Friend Request.' : 'Outgoing Friend Request.'}</span>
                            </div>
                        </div>
                        {/* --------- */}
                        {
                            penFr.type === 'incoming' ? (
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => handleAccept(penFr.friendRequestId)}
                                        className='w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white
                                    flex items-center justify-center transition-colors'>
                                        <Check size={20}/>
                                    </button>
                                    <button
                                        onClick={() => handleReject(penFr.friendRequestId)}
                                        className='w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white
                                        flex items-center justify-center transition-colors' title='Decline'>
                                        <X size={20}/>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        handleCancel(penFr.friendRequestId)
                                    }}
                                    className='px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all
                                        text-sm font-medium' title='Cancel'>
                                    Cancel Request
                                </button>
                            )
                        }
                    </div>
                ))}
            </div>
                {pendingFriend.length === 0 && (
                    <div className="flex h-64 items-center justify-center text-center text-slate-400 mt-10">
                        <p>No pending requests right now.</p>
                    </div>
                )}
        </div>
    );
}