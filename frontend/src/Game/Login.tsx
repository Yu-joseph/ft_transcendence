import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


function Login() {
<<<<<<< Updated upstream:frontend/src/Login.tsx
=======

  const [showSignIn, setShowSignIn] = useState(false);
  // const [state, setState] = useState("Sign up");
>>>>>>> Stashed changes:frontend/src/Game/Login.tsx
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-center mb-10">
        <span className="bg-linear-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Tic
        </span>{" "}
        <span className="bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Tac
        </span>{" "}
        <span className="bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Toe
        </span>{" "}
        <span className="bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Game
        </span>
      </h1>

<<<<<<< Updated upstream:frontend/src/Login.tsx
      <SignedOut>
        <div className="flex flex-col items-center gap-4">
          <p className="text-white text-xl">Please sign in to play.</p>
          <SignInButton>
            <button
              className="px-6 py-3 text-lg font-semibold rounded-xl 
=======
      {/* <SignedOut> */}
          {/* <div></div> */}
          <p className="text-white text-xl mb-4">Please sign in or signup in to play.</p>
        <div className="flex flex-row items-center gap-4">
          {/* <SignInButton> */}
            <button onClick={() => setShowSignIn(true)} className="px-6 py-3 text-lg font-semibold rounded-xl 
>>>>>>> Stashed changes:frontend/src/Game/Login.tsx
                         bg-linear-to-r from-indigo-500 to-purple-600
                         text-white hover:scale-105 transition"
            >
              Sign In
            </button>
<<<<<<< Updated upstream:frontend/src/Login.tsx
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>
    </div>
  );
}
=======
            <button className="px-6 py-3 text-lg font-semibold rounded-xl 
                         bg-linear-to-l from-indigo-500 to-purple-600
                         text-white hover:scale-105 transition"
            >
              Sign up
            </button>
          {/* </SignInButton> */}
        </div>
        {showSignIn && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"> <
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl flex flex-col gap-4">

            </div>
            </div>
            {/* Header */}
        )}
      {/* </SignedOut> */}

      {/* <SignedIn> */}
        {/* <RedirectToDashboard /> */}
      {/* </SignedIn> */}
    
)
>>>>>>> Stashed changes:frontend/src/Game/Login.tsx

// Separate component to handle redirect after sign in
function RedirectToDashboard() {
  const navigate = useNavigate();
//Component renders → UI is ready → useEffect runs → navigate("/Dashboard")
  useEffect(() => {
    navigate("/Dashboard");
  }, [navigate]);

  return (
    <p className="text-white text-xl">Redirecting to lobby...</p>
  );
}

export default Login;
