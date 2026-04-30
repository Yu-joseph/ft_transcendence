import { useRef, useState } from "react";
import type { UserProfileInfo } from "./useProfileHeader";

export  function    useEditeProfileModale(initialData: UserProfileInfo, isOpen: boolean) {

    const   [errors, setErrors] = useState<Record<string, string> | null>(null);
   const    fileInputRef = useRef<HTMLInputElement>(null);
   const    [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.avatar ?? null);
   const    [avatar, setAvatar] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        fullname: initialData?.fullname || '' as string,
        bio: initialData?.bio || '' as string,
        email: initialData?.email || '' as string,
        avatar: initialData?.avatar || '' as string
    });

    const validateForm = () => {
        const   newErrors: Record<string, string> = {};
        const   isAnyFieldEmpty = formData.fullname.trim().length === 0 && formData.email.trim().length === 0 && formData.bio.trim().length === 0;
        if(isAnyFieldEmpty) {
            newErrors.fullname = 'Please fill at least one field.';
            setErrors(newErrors);
            return false;
        }
        if(formData.fullname.trim().length !== 0 && formData.fullname.trim().length < 3) {
            newErrors.fullname = 'Full-name must be at least 3 characters.';
        }
        else if(formData.fullname.trim().length !== 0 && formData.fullname.trim().length > 50) {
            newErrors.fullname = 'Full-name must be less than 50 characters.';
        }
        else if (formData.fullname.trim().length !== 0 && /[<>]/.test(formData.fullname)) {
            newErrors.fullname = 'Html tags are not allowed.';
        }
        const   emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(formData.email.trim().length !== 0 && !emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email address.';
        }

        if(formData.bio.trim().length !== 0 && formData.bio.trim().length < 10) {
            newErrors.bio = 'Bio must be at least 10 characters.';
        }
        else if(formData.bio.trim().length !== 0 && formData.bio.trim().length > 100) {
            newErrors.bio = 'Bio must be less than 100 characters.';
        }
        else if (formData.bio.trim().length !== 0 && /[<>]/.test(formData.bio)) {
            newErrors.bio = 'Html tags are not allowed.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    if (!isOpen)
        return null;
    // Handle Image Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) {
            setAvatar(null);
            return;
        }
        if(!file?.type.startsWith('image/')) {
            console.log('Invalid Image');
            setErrors({...errors, avatar: 'Invalid Image type.'}); // *****
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
        if(!file)
            return ;
        const fd = new FormData();
        console.log('before append:', fd);
        fd.append('avatar', file);
        console.log('After append:', fd);
        try {
            const res = await fetch('/authent/update_avatar/', {
                method: 'POST',
                body: fd,
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
            const data = await res.json();
            console.log('response of upload avatar:', data);
            setPreviewUrl(data.url);
            setFormData({...formData, avatar: data.url as string});
            console.log('AVATAR URL IN UPLOAD:', data.url);
            return data.url;
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
        validateForm,
        avatar,
        formData,
        errors,
        setErrors
    };
}