import React, { useState, useRef } from 'react';
import { X, Save, Camera, User, FileText, Mail, LockIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
// import type { UserProfileInfo } from './hooks/useProfileHeader';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any;
    onSave: (updatedData: any) => void;
}

/**
 * 
 * @param param3 userInfo Data  type of 'UserProfileInfo'
 * @returns 
 */

export function EditProfileModal({ isOpen, onClose, initialData, onSave }: EditProfileModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // const   [username, setUsername] = useState<string>('');
    // const   [email, setEmail] = useState<string>('');
    // const   [bio, setBio] = useState<string>('');


    const   navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullname: initialData?.fullname || '' as string,
        bio: initialData?.bio || '' as string,
        email: initialData?.email || '' as string
    });

    // const   [avatar, setAvatar] = useState({avatar:})

    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.avatar ?? null);

    if (!isOpen)
        return null;
    // Handle Image Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log("file:", file);
        if(!file?.type.startsWith('image/')) {
            console.log('Invalid Image');
            return;
        }
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            // setFormData({ ...formData, avatar: file }); 
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

    return createPortal(

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 overflow-hidden relative">
                                <img src={previewUrl || ''} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold text-center">Click to change photo</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <User size={14} className="text-blue-400" /> Full Name
                        </label>
                        <input 
                            type="text"
                            value={formData.fullname}
                            onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            placeholder="Enter your full name"
                            />
                    </div>
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-400 flex items-center gap-2'>
                            <Mail size={14} className='text-red-400'/>Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder='Enter your email'
                            className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors'
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <FileText size={14} className="text-purple-400" /> Bio
                        </label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors h-32 resize-none"
                            placeholder="Tell us about yourself..."
                            />
                    </div>
                </div>
                <button
                onClick={() => {navigate('/profile/setting')}}
                    type='button'
                    className='w-full text-slate-400 bg-slate-500/10 py-1.5 rounded-xl text-sm font-medium mt-2 flex justify-center hover:text-white duration-300 cursor-pointer
                        gap-2 border border-white/10 focus:outline-none hover:border-rose-400/30'
                    >
                        <LockIcon size={16}/>
                        <span>Change password</span>
                </button>
                <div className="flex gap-3 mt-10">
                    <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(formData)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>,
        document.body
);
}
