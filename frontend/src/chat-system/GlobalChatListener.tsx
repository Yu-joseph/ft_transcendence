import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { chatSocket } from "../socket/sock";
import { useNavigate } from "react-router-dom";
import { MessageSquare, UserPlus, X } from "lucide-react";

type    TargetTabType = 'friends' | 'pending';

export const  GlobalChatListener = () => {
    const   {user} = useAuth();
    const   [notification, setNotification] = useState<{mssg: string, type: string, targetTab?: TargetTabType} | null>(null);
    const   navigate = useNavigate();
    const   timeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if(!user?.id) {
            if(chatSocket.connected) {
                chatSocket.disconnect();
            }
            return;
        }
        if(!chatSocket.connected) {
            chatSocket.connect();
        }
        /**_________________________________________________________ */
        const   handleFriendUpdate = (data: {senderName: string, type: string}) => {
            if(timeOutRef.current) // clearing old timeout if a new notification comes in
                clearTimeout(timeOutRef.current);

            if(data.type === 'REQUEST') {
                setNotification({
                    mssg: `${data.senderName} sent you a friend request`,
                    type: 'friend',
                    targetTab: 'pending'
                });
            }
            else if(data.type === 'ACCEPT') {
                setNotification({
                    mssg: `${data.senderName} accepted your friend request`,
                    type: 'friend',
                    targetTab: 'friends'
                });
            }
            else if(data.type === 'REJECT') {
                setNotification({
                    mssg: `${data.senderName} declined your friend request`,
                    type: 'friend',
                    targetTab: 'pending'
                });
            }
            else if(data.type === 'REMOVE') {
                setNotification({
                    mssg: `${data.senderName} removed you from their friends`,
                    type: 'friend',
                    targetTab: 'friends'
                });
            }
            window.dispatchEvent(new Event("refresh_friends"));
            const duration = (data.type === 'REQUEST' || data.type === 'ACCEPT') ? 5000 : 7000;
            timeOutRef.current = setTimeout(() => setNotification(null), duration);
        }
        /**_________________________________________________________ */
        const   handleNewMessageNotify = (data: {senderName: string, content: string}) => {
            if(window.location.pathname !== '/Chat') {
                if(timeOutRef.current)
                    clearTimeout(timeOutRef.current);
                const truncatedContent = data.content.length > 40 ? data.content.substring(0, 37) + '...' : data.content;
                setNotification({
                    mssg: `${data.senderName}: ${truncatedContent}`,
                    type: 'message',
                    
                });
                timeOutRef.current = setTimeout(() => setNotification(null), 5000);
            }           
        }

        /************* Globale Event Listener ********************** */
        chatSocket.on('notification:friend_update', handleFriendUpdate);
        chatSocket.on('notification:new_message', handleNewMessageNotify);
        /******************************************************* */
        const onSocketErr = (err: { message: string }) => {
            if(timeOutRef.current)
                clearTimeout(timeOutRef.current);

            setNotification({
                mssg: err.message || "An unexpected chat error occurred",
                type: 'error',
            });
            timeOutRef.current = setTimeout(() => setNotification(null), 5000);
        };

        /**_______________________________________ */

        const onConnErr = (err: any) => {};
        chatSocket.on('connect_error', onConnErr);
        chatSocket.on('error', onSocketErr);
        /******************************************************** */
        return () => {
            chatSocket.off('connect_error', onConnErr);
            chatSocket.off('error', onSocketErr);
            chatSocket.off('notification:friend_update', handleFriendUpdate);
            chatSocket.off('notification:new_message', handleNewMessageNotify);
            if(timeOutRef.current)
                clearTimeout(timeOutRef.current);
        }

    }, [user?.id])
    /************** Component Loic ******************** */

    /**__________ Handle click ___________ */
    const   handleClick = () => {
        if(!notification)
            return ;

        if(notification.type === 'friend')
            navigate('/Friends', { state: { activeTab: notification.targetTab } });
        if (notification.type === 'message')
            navigate('/Chat');
        setNotification(null);
    }



    if(notification === null)
        return null;
    return (
        <div className="fixed top-25 right-4 z-100 animate-in fade-in slide-in-from-right-10 duration-500">
            <div
                onClick={handleClick}
                className="group relative flex items-center gap-4 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer transition-all hover:border-white/20 active:scale-95 min-w-[300px] max-w-sm overflow-hidden"
            >
                {/* the vertical line that displayed on the left hande of the notification block*/}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                    ${notification.type === 'friend' ? 'bg-emerald-500' : 
                      notification.type === 'error' ? 'bg-red-500' : 'bg-indigo-500'}`} 
                />
                
                {/* Icon Container */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 
                    ${notification.type === 'friend' ? 'bg-emerald-500/10 text-emerald-400' : 
                      notification.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    {notification.type === 'friend' ? <UserPlus size={24} /> : 
                     notification.type === 'error' ? <X size={24} /> : <MessageSquare size={24} />}
                </div>

                {/* Content/ notification message */}
                <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[15px] font-bold text-white leading-tight mb-1 truncate">
                        {notification.type === 'message' ? 'New Message' : 
                         notification.type === 'error' ? 'Chat Action Failed' : 'Friend Update'}
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed truncate">
                        {notification.mssg}
                    </p>
                </div>

                {/* Close notification Button  */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setNotification(null);
                    }}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={14} />
                </button>

                {/* hint to let user click */}
                {notification.type !== 'error' && (
                    <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            View Details
                        </p>
                    </div>
                )}
            </div>
        </div>

        // <div className="fixed top-25 right-4 z-100 animate-in fade-in slide-in-from-right-10 duration-500">
        //     <div
        //         onClick={handleClick}
        //         className="group relative flex items-center gap-4 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer transition-all hover:border-white/20 active:scale-95 min-w-[300px] max-w-sm overflow-hidden"
        //     >
        //         {/* the vertical line that displayed on the left hande of the notification block*/}
        //         <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notification.type === 'friend' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                
        //         {/* Icon Container */}
        //         <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${notification.type === 'friend' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
        //             {notification.type === 'friend' ? <UserPlus size={24} /> : <MessageSquare size={24} />}
        //         </div>

        //         {/* Content/ notification message */}
        //         <div className="flex-1 min-w-0 pr-4">
        //             <p className="text-[15px] font-bold text-white leading-tight mb-1 truncate">
        //                 {notification.type === 'message' ? 'New Message' : 'Friend Update'} {/* title of notification */}
        //             </p>
        //             <p className="text-sm text-slate-400 leading-relaxed truncate">{/* notification message */}
        //                 {notification.mssg}
        //             </p>
        //         </div>

        //         {/* Close notification Button  */}
        //         <button 
        //             onClick={(e) => {
        //                 e.stopPropagation(); {/* this prevent the parent to receive this click, so just that close click will be runned  */}
        //                 setNotification(null);
        //             }}
        //             className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors"
        //         >
        //             <X size={14} />
        //         </button>

        //         {/* just a hint to let user click to see the event */}
        //         <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        //             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        //                 View Details
        //             </p>
        //         </div>
        //     </div>
        // </div>
    );

}