import  { Ban, UserCheck }   from 'lucide-react';

export  function BlockedFriend() {
    const   blocker = [
        {id: 1, username: 'spam'},
        {id: 2, username: 'mait'},
        {id: 3, username: 'fred'},
        {id: 4, username: 'jack'},

    ]
    return (
        <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-6 lg:p-6">
            <div className="mb-6">
                <h1 className='text-white font-bold text-3xl flex items-center gap-3'>
                    <Ban className='text-red-500' size={32}/>
                    Blocked Users
                </h1>
                <p className='text-slate-400'>Users you have rejected friend requests from.</p>
            </div>
            <div className='flex flex-col gap-4'>
                {blocker.map((user) => (
                    <div key={user.id} className='flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl'>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className='text-slate-300 font-medium text-lg'>{user.username}</span>
                        </div>
                        <button className='flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700
                        hover:text-white transition-colors text-sm font-medium'>
                            <UserCheck size={18}/>
                            Unblock
                        </button>
                    </div>
                ))}
                {blocker.length === 0 && (
                    <div className='flex h-64 items-center justify-center text-center text-slate-400 mt-10'>
                        <p>You haven't blocked anyone. Nice!</p>
                    </div>  
                )}
            </div>
        </div>
    );
}