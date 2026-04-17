import { useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";


export  function useAddFriend() {
    const   [input, setInput] = useState('');
    const   [loading, setLoading] = useState(false);
    const   [status, setStatus] = useState<{type: 'success' | 'error'; message: string} | null>(null);

    /**____ Send Friend Request ______ */
    const   handleSubmit = async (e: any) => {
        e.preventDefault();
        const username = input.trim();
        if(username === '') {
            console.log('empty form!!');
            setStatus({type: 'error', message: 'Enter at least 4 characters'});
            return;
        }

        console.log("Username is:", username);
        try {
            setLoading(true);
            setStatus(null);
            const   option = {
                method: 'POST',
                body: JSON.stringify({receiverId: username})
            };
            const   result = await fetchClient('/friend/request', option);
            setInput('');
            setStatus({type: 'success', message: 'Friend request sent'});
            console.log("result adding:", result);
            
        } catch (error: any) {
            console.log('error is:', error);
            setStatus({type: 'error', message: error?.message ?? 'Failed to send request'})
        } finally {
            setLoading(false); 
        }
    }
    /**______________________________ */
    return {
        handleSubmit,
        setInput,
        input,
        loading,
        status
    }
}