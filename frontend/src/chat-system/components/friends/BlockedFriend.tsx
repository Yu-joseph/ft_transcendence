import  { Ban, UserCheck }   from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchClient } from '../../utils/fetchClient';


interface BlockedFriendType {
    id: string
    username: string
    avatar: string
}


export  function BlockedFriend() {
    const   [loading, setLoading] = useState(false);
    const   [error, setError] = useState(null);
    const   [blocked, setBlocked] = useState<BlockedFriendType[]>([]);

    const   [status, setStatus] = useState<{type: 'success' | 'error'; message: string} | null>(null);

    
    useEffect(() => {
        const   getBlockedRequest = async () => {
            try {
                setLoading(false);
                const result : BlockedFriendType[] = await fetchClient('/friend/rejected', {});
                setBlocked(result);
            } catch (error: any) {
                setError(error);
                console.log(error);
            } finally {
                setLoading(true);
            }
        }

        getBlockedRequest();
    }, [])

    const   handleUnblock = async (receiverName: string) => {
        try {
            setStatus(null);
            const   result = await fetchClient('/friend/request', {
                method: 'POST',
                body: JSON.stringify({receiverId: receiverName})
            });
            setBlocked(prev => prev.filter(u => u.username !== receiverName));
            setStatus({type: 'success', message: 'Friend Unblocked successfuly'});
            console.log(result);
        } catch (error: any) {
            setStatus({type: 'error', message: error?.message ?? 'Failed to add friend'})
            console.log(error);
        }
    }

    if (!loading) {
        return <div className='text-slate-600 flex items-center justify-center'>Loading...</div>
    }
    if(error)
        return <div className='text-red-400 flex items-center justify-center'>{error}</div>
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
                {blocked.map((user) => (
                    <>
                    <div key={user.id} className='flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl'>
                                {user.username.charAt(0).toUpperCase()}
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
                {blocked.length === 0 && (
                    <div className='flex h-64 items-center justify-center text-center text-slate-400 mt-10'>
                        <p>You haven't blocked anyone. Nice!</p>
                    </div>  
                )}
            </div>
        </div>
    );
}