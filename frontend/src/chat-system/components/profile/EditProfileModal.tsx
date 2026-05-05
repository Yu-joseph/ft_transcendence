import { X, Save, Camera, User, FileText, Mail, LockIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useEditeProfileModale } from './hooks/useEditeProfileModal';
import type { UserProfileInfo } from './hooks/useProfileHeader';
import { useState } from 'react';
import { useAuth } from '../../../auth/useAuth';
interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any;
    onHandleSaveInfo: (updatedData: any, isUserInfoChanged: boolean) => Promise<void>;
    serverError: string | null;
    setServerError: React.Dispatch<React.SetStateAction<string | null>>;
    isSavingProfile: boolean
}

/**
 * @param param3 userInfo Data  type of 'UserProfileInfo'
 * @returns 
 */

export function EditProfileModal({ isOpen, onClose, initialData, onHandleSaveInfo, serverError, setServerError, isSavingProfile }: EditProfileModalProps) {
    const {user} = useAuth();
    const   navigate = useNavigate();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    /**_______________ Costume Hook __________________ */
    const   hook = useEditeProfileModale(initialData as UserProfileInfo, isOpen);
    if(hook === null)
        return;

    const   {
        fileInputRef,
        handleImageChange,
        uploadAvatar,
        previewUrl,
        setFormData,
        avatar,
        formData,
        validateForm,
        errors,
        setErrors
    } = hook;

    const handleSaveInfo = async () => {
        if(validateForm()) {
            setIsUploading(true);
            setServerError(null);
            try {
                const finalData = { ...formData };
                // Check if user info was modified by checking against initialData
                const isUserInfoChanged = 
                    formData.fullname !== initialData?.fullname ||
                    formData.email !== initialData?.email ||
                    formData.bio !== initialData?.bio;
                /**________  */
                // If they opened the modal and hit Save without touching ANYTHING, so just close the model
                if (!avatar && !isUserInfoChanged) {
                    setIsUploading(false);
                    onClose();
                    return;
                }
                /** __________ Call avatr uplaod if the avatar changed/exist */
                if(avatar) {
                    const newAvatarUrl = await uploadAvatar(avatar); // if this fails it throws an error and stop 
                    finalData.avatar = newAvatarUrl;
                    window.dispatchEvent(new CustomEvent<{avatarUrl: string, userId: string | null}>("avatar:update", {detail: {avatarUrl: newAvatarUrl, userId: user?.id ?? null}})); // emit event for updating avatar in the bar component
                }
                await onHandleSaveInfo(finalData, isUserInfoChanged);
            } catch (error: unknown) {
                if (error instanceof Error)
                    setServerError(error.message);
                else
                    setServerError("Failed to save profile changes.");
            } finally {
                setIsUploading(false);
            }
        }
    }


    /**__________________________________________________________________ */
    return createPortal(

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ overflowAnchor: 'none' }}>
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
                            <input
                                type="file"
                                ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold text-center">Click to change photo</p>
                        {errors?.avatar && <p className="text-red-400 text-sm">{errors.avatar}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <User size={14} className="text-blue-400" /> Full Name
                        </label>
                        <input 
                            type="text"
                            value={formData.fullname}
                            onChange={(e) => {
                                    setFormData({...formData, fullname: e.target.value});
                                    if(errors?.fullname) setErrors({...errors, fullname: ''});
                                }
                            } 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            placeholder="Enter your full name"
                            />
                        {errors?.fullname && <p className="text-red-400 text-sm">{errors.fullname}</p>}
                    </div>
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-400 flex items-center gap-2'>
                            <Mail size={14} className='text-red-400'/>Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                                    setFormData({...formData, email: e.target.value});
                                    if(errors?.email) setErrors({...errors, email: ''});
                                }
                            }
                            placeholder='Enter your email'
                            className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors'
                        />
                        {errors?.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <FileText size={14} className="text-purple-400" /> Bio
                        </label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => {
                                    setFormData({...formData, bio: e.target.value});
                                    if(errors?.bio) setErrors({...errors, bio: ''});
                                }
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors h-32 resize-none"
                            placeholder="Tell us about yourself..."
                            />
                        {errors?.bio && <p className="text-red-400 text-sm">{errors.bio}</p>}
                    </div>
                    {/* /** error update profile */ }
                    <div className='space-y-6'>
                        {serverError && (
                            <div className='bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-medium animate-in fade-in zoom-in duration-300'>
                                {serverError}
                            </div>
                        )}
    
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
                        onClick={handleSaveInfo}
                        disabled={isSavingProfile || isUploading}
                        className="disabled:opacity-50 disabled:cursor-not-allowed flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                        {!(isSavingProfile || isUploading) ? (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                            ) : ('Saving Changes...')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
);
}