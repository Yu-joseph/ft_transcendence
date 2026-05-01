import { useState } from "react";
import { fetchClient } from "../../../utils/fetchClient";

export type status = 'error' | 'success';

export  function useAddFriend() {
    const   [input, setInput] = useState('');
    const   [loading, setLoading] = useState(false);
    const   [state, setState] = useState<{status: status, message: string} | null>(null);

    /**____ Send Friend Request ______ */
    const   handleSubmit = async (e: any) => {
        e.preventDefault();
        setState(null);
        const username = input.trim();
        if(username === '' || username.length > 15) {
            console.log('empty form!!');
            setState({status:'error', message: 'enter a valid username.'});
            return;
        }
        if(/[<>]/.test(username)) {
            setState({status: 'error', message: 'Invalid username.'});
            return;
        }
        console.log("Username is:", username);
        try {
            setLoading(true);
            setState(null);
            const   option = {
                method: 'POST',
                body: JSON.stringify({username: username})
            };
            const   result = await fetchClient('/friend/request', option);
            setInput('');
            setState({status: 'success', message: 'Friend request sent'});
        } catch (error: any) {
            console.log('error is:', error);
            setState({status: 'error', message: error?.message ?? 'Failed to send request'});
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
        state
    }
}