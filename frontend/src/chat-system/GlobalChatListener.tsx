import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { chatSocket } from "../socket/sock";
import { data, useNavigate } from "react-router-dom";




export const  GlobalChatListener = () => {
    const   [notification, setNotification] = useState<{mssg: string, type: string} | null>(null);
    const   navigate = useNavigate();
    const   {user} = useAuth();

    useEffect(() => {
        if(!user)
            return;
        if(!chatSocket.connected){
            chatSocket.connect();
        }
        /**_________________________________________________________ */
        const   handleFriendUpdate = (data: {senderName: string, type: string}) => {

            if(data.type === 'REQUEST') {
                setNotification({
                    mssg: `👥 New friend request from ${data.senderName}`,
                    type: 'friend'
                });
            }
            if(data.type === 'ACCEPT') {
                setNotification({
                    mssg: `${data.senderName} accepted your friend request.`,
                    type: 'friend'
                });
            }
            if(data.type === 'REJECT') {
                setNotification({
                    mssg: `Oops!, ${data.senderName} rejected your friend request`,
                    type: 'friend'
                });
            }
            if(data.type === 'REMOVE') {
                setNotification({
                    mssg: `Oops!, ${data.senderName} blocked you from it's friend, you are not friends anymore`,
                    type: 'friend'
                });
            }
            window.dispatchEvent(new Event("refresh_friends"));
            if(data.type === 'REQUEST' || data.type === 'ACCEPT')
                setTimeout(() => setNotification(null), 5000);
            else
                setTimeout(() => setNotification(null), 7000);

        }
        /**_________________________________________________________ */
        const   handleNewMessageNotify = (data: {senderName: string, content: string}) => { 
            if(window.location.pathname !== '/Chat') {
                setNotification({
                    mssg: `💬 ${data.senderName}: ${data.content}`,
                    type: 'message'
                });
                setTimeout(() => setNotification(null), 5000);
            }           
        }

        /************* Globale Event Listener ********************** */
        chatSocket.on('notification:friend_update', handleFriendUpdate);
        chatSocket.on('notification:new_message', handleNewMessageNotify);

        return () => {
            chatSocket.off('notification:friend_update', handleFriendUpdate);
            chatSocket.off('notification:new_message', handleNewMessageNotify);
        }

    }, [user])
    /************** Component Loic ******************** */
    if(notification === null)
        return null;
    return (
        <div className="fixed top-20 right-4 z-100 animate-bounce-in">
            <div
                onClick={() => notification.type === 'message' && navigate('/Chat')}
                className={`p-4 rounded-xl shadow-2xl border cursor-pointer transition-all hover:scale-105
                 ${notification.type === 'friend' ? 'bg-emerald-900 border-emerald-500' : 'bg-blue-900 border-blue-500'}`}
                >
                    <p className="text-white font-medium">{notification.mssg}</p>
                    <p className="text-xs text-slate-300 mt-1 italic">Click to view</p>
            </div>
        </div>
    );

}