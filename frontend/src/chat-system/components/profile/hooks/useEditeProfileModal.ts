import { useRef, useState } from "react";

type    InputType = 'fullname' | 'email' | 'bio';

export  function    useEditeProfileModale(initialData: any, isOpen: boolean) {


   const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        fullname: initialData?.fullname || '' as string,
        bio: initialData?.bio || '' as string,
        email: initialData?.email || '' as string
    });

    const   [inputError, setInputError] = useState<{inputType: InputType, errorMessage: string} | null>(null);


    const   [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.avatar ?? null);
    const   [avatar, setAvatar] = useState<File | null>(null);

    if (!isOpen)
        return null;
    // Handle Image Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) {
            setAvatar(null);
            return;
        }
        console.log('Changing the avatar........');
        console.log("file:", file);
        if(!file?.type.startsWith('image/')) {
            console.log('Invalid Image');
            setAvatar(null);
            return;
        }
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setAvatar(file);
        }
    };

    const uploadAvatar = async (file: File) => {
        const fd = new FormData();
        console.log('before append:', fd);
        fd.append('avatar', file);
        console.log('After append:', fd);
        try {
            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: fd,
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
            const data = await res.json();
            setPreviewUrl(data.url);
        } catch (err) {
            console.error(err);
        }
    }
    /**___________________________________________ */
    return {
        fileInputRef,
        handleImageChange,
        uploadAvatar,
        previewUrl,
        setFormData,
        inputError,
        avatar,
        formData,
        setInputError
    };
}