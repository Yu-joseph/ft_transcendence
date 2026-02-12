import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Login() {
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

      <SignedOut>
        <div className="flex flex-col items-center gap-4">
          <p className="text-white text-xl">Please sign in to play.</p>
          <SignInButton>
            <button
              className="px-6 py-3 text-lg font-semibold rounded-xl 
                         bg-linear-to-r from-indigo-500 to-purple-600
                         text-white hover:scale-105 transition"
            >
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <RedirectToLobby />
      </SignedIn>
    </div>
  );
}

// Separate component to handle redirect after sign in
function RedirectToLobby() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/lobby");
  }, [navigate]);

  return (
    <p className="text-white text-xl">Redirecting to lobby...</p>
  );
}

export default Login;
