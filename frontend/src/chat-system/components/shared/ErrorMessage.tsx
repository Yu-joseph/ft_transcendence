export type TypeOfError = 'conversations'| 'messages' | 'friends' | 'pending requests' | 'rejected requests' | 'profile information'; 

export const ErrorMessage = ({message, typeOfError}: {message: string|null, typeOfError: TypeOfError}) => {
    return (
      <aside className="w-full h-full max-w-sm flex flex-col bg-slate-900/60 backdrop-blur-md border border-red-900/50 rounded-2xl p-6 shadow-xl items-center justify-center text-center mx-auto">
        <div className="text-red-400 mb-2">
        </div>
        <p className="text-slate-300 px-2">
          {typeof message === 'string' && message.includes('Authorisation header missing')  ? 'Youre session has expired. Please login again' : `An error occurred while loading ${typeOfError}.`}
        </p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-white transition-all">
          Try Again
        </button>
      </aside>
    );
}