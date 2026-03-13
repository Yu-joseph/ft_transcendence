import  { Check, UserSearch, X }    from    'lucide-react';

type RequestType = 'incoming' | 'outgoing';

export  function    PendingRequests() {

    const   requests = [
        {id: 1, username: 'user1', type: 'incoming' as RequestType},
        {id: 2, username: 'user2', type: 'outgoing' as RequestType},
        {id: 3, username: 'user3', type: 'incoming' as RequestType},
        {id: 4, username: 'user4', type: 'outgoing' as RequestType},
        {id: 5, username: 'user5', type: 'incoming' as RequestType}
    ]


    return (
        <div className="flex flex-col w-full">
            <div className='mb-6'>
                <h1 className='text-3xl font-bold flex items-center gap-3 text-white'>
                    <UserSearch className='text-emerald-400' size={32}/>
                    Pending Requests
                </h1>
                <p className='mt-1 text-slate-400'>Manage your incoming and outgoing friend requests.</p>
            </div>
            <div className='flex flex-col gap-4'>
                {requests.map((req) => (
                    <div key={req.id}
                        className='flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all hover:bg-slate-800/60'
                    >
                        <div className='flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center
                            text-white font-bold text-xl shadow-inner'>
                                {req.username.charAt(0).toLocaleLowerCase()}
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-white font-medium text-lg'>{req.username}</span>
                                <span className='text-sm text-slate-400'>{req.type === 'incoming' ? 'Incoming Friend Request.' : 'Outgoing Friend Request.'}</span>
                            </div>
                        </div>
                        {/* --------- */}
                        {
                            req.type === 'incoming' ? (
                                <div className='flex items-center gap-2'>
                                    <button className='w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white
                                    flex items-center justify-center transition-colors'>
                                        <Check size={20}/>
                                    </button>
                                    <button className='w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white
                                    flex items-center justify-center transition-colors' title='Decline'>
                                        <X size={20}/>
                                    </button>
                                </div>
                            ) : (
                                <button className='px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all
                                text-sm font-medium'>
                                    Cancel Request
                                </button>
                            )
                        }
                    </div>
                ))}
            </div>
                {requests.length === 0 && (
                    <div className="flex h-64 items-center justify-center text-center text-slate-400 mt-10">
                        <p>No pending requests right now.</p>
                    </div>
                )}
        </div>
    );
}