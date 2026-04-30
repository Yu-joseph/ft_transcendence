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
                    Blocked Users
                </h1>
                <p className='text-slate-400'>Users you have rejected friend requests from.</p>
            </div>
            <div className='flex flex-col gap-4'>
                {
                    loading && (
                        [1,2,3,4].map(i => (
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
                blocked.map((user) => (
                    <>
                    <div key={user.id} className='flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl'>
                                <img
                                    src={`${user.avatar}`}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover rounded-full flex items-center justify-center"
                                />
                            </div>
                            <span className='text-slate-300 font-medium text-lg'>{user.username}</span>
                        </div>
                        <button 
                            className='flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700
                             hover:text-white transition-colors text-sm font-medium'
                            onClick={() => handleUnblock(user.username)} 
                            >
                            <UserCheck size={18}/>
                            Unblock
                        </button>
                    </div>
                    {status && (
                        <div className={status?.type === 'success' ? 'text-green-600 m-2' : 'text-red-600 m-2'}
                        >
                            {status?.message}
                        </div>
                    )}
                    </>
                ))}
                {!loading && !error && blocked.length === 0 && (
                    <div className='flex h-64 items-center justify-center text-center text-slate-400 mt-10'>
                        <p>You haven't blocked anyone. Nice!</p>
                    </div>  
                )}
            </div>
        </div>
    );
}