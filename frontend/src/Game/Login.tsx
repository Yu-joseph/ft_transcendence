<<<<<<< HEAD
// import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupFullname, setSignupFullname] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const { user, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();

  

  // Show loading state while auth context is still fetching
  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-white">Loading...</p></div>;
  }

  if (user) {
    return <Navigate to="/Dashboard" replace />;
  }

  // Reads any API response safely, handling JSON and plain text payloads.
  const readApiResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type") ?? "";
    const raw = await response.text();

    if (!raw) {
      return { data: null, isJson: contentType.includes("application/json") };
    }

    if (contentType.includes("application/json")) {
      try {
        return { data: JSON.parse(raw), isJson: true };
      } catch {
        throw new Error("Server returned invalid JSON.");
      }
    }

    return { data: raw, isJson: false };
  };

  // Submits login credentials, stores returned user data, and redirects on success.
  const submitLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      //trim to remove spaces from start and end
      const loginId = emailOrUsername.trim();
      const isEmail = loginId.includes("@");
      const response = await fetch("http://localhost:8080/authent/login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEmail ? { email: loginId } : { username: loginId }),
          password,
        }),
      });

      const { data, isJson } = await readApiResponse(response);

      if (!response.ok) {
        // console.log(response);
        if (!isJson) {
          throw new Error("Login endpoint return false.");
        }
        const message = typeof data?.error === "string" ? data.error : "Login failed. Please try again.";
        throw new Error(message);
      }

      // Fetch authenticated profile and push it into global auth context.
      const userResponse = await fetch("http://localhost:8080/authent/getuser/", {
        method: "GET",
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser({
          id: String(userData.id ?? userData.user?.id ?? ""),
          username: userData.username ?? userData.user?.username ?? loginId ?? "Player",
          fullName: userData.fullname ?? userData.fullName ?? userData.user?.fullname,
          email: userData.email ?? userData.user?.email,
          avatar: userData.avatar ?? userData.profile?.avatar,
        });
      } else {
        // Treat 401/not-ok as unauthenticated without raising an error.
        setUser(null);
      }

      // Redirect to dashboard
      navigate("/Dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handles form submit and prevents page reload.
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitLogin();
  };

  // Handles click on the sign-in button.
  const handleLoginClick = () => {
    void submitLogin();
  };

  // Submits sign-up data and resets form state when account creation succeeds.
  const submitSignup = async () => {
    setSignupError(null);
    setSignupSuccess(null);
    setSignupLoading(true);

    try {
      const response = await fetch("http://localhost:8080/authent/register/", {
        method: "POST",
        headers: {
          //this for http header telling server that request is formated as JSON
          "Content-Type": "application/json",
          //telling backend auth that body is json data without the server might not parse data
        },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          fullname: signupFullname,
          password: signupPassword,
        }),
      });

      const { data, isJson } = await readApiResponse(response);

      if (!response.ok) {
        if (!isJson) {
          throw new Error("Signup endpoint returne signup.");
        }
        const message = typeof data?.error === "string" ? data.error : "Sign up failed. Please try again.";
        throw new Error(message);
      }

      setSignupSuccess("Account created. You can sign in now.");
      setSignupUsername("");
      setSignupEmail("");
      setSignupFullname("");
      setSignupPassword("");
      setTimeout(() => {
        setShowSignup(false);
        setSignupSuccess(null);
      }, 1000);
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSignupLoading(false);
    }
  };

  // Handles sign-up form submit and prevents page reload.
  const handleSignupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitSignup();
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-5xl font-extrabold leading-tight text-white">
            <span className="bg-linear-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Tic</span>{" "}
            <span className="bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Tac</span>{" "}
            <span className="bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Toe</span>{" "}
            <span className="bg-linear-to-r from-amber-500 to-indigo-500 bg-clip-text text-transparent">Arena</span>
          </h1>
          <p className="text-slate-200 text-lg max-w-lg">
            Sign in to join live matches, climb the ladder, and create tournaments with your friends.
          </p>
          <div className="flex items-center gap-2 justify-center md:justify-start text-amber-300 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Secure sign-in with server-side session cookies.
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-400/20 shadow-2xl shadow-amber-900/20 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Sign in</h2>
            <span className="text-xs text-amber-200 bg-amber-900/30 px-2 py-1 rounded-full">Play now</span>
          </div>

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="space-y-2">
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-amber-200">
                Email or Username
              </label>
              <input
                type="text"
                id="emailOrUsername"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter email or username"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-amber-200">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm bg-red-900/50 border border-red-500/30 p-2 rounded">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleLoginClick}
              className="w-full py-2.5 px-4 rounded-lg bg-linear-to-r from-amber-600 to-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-sm text-slate-300 text-center">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setSignupError(null);
                  setSignupSuccess(null);
                  setShowSignup(true);
                }}
                className="text-amber-300 hover:text-amber-200 underline"
              >
                Create one
              </button>
            </p>
          </form>
        </div>
      </div>

      {showSignup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSignup(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-slate-950/90 border border-amber-400/30 shadow-2xl shadow-amber-900/30 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Create account</h2>
              <button
                type="button"
                onClick={() => setShowSignup(false)}
                className="text-slate-300 hover:text-white"
                aria-label="Close sign up popup"
              >
                X
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSignupSubmit}>
              <div>
                <label htmlFor="signupUsername" className="block mb-1 text-sm font-medium text-amber-300">
                  Username
                </label>
                <input
                  type="text"
                  id="signupUsername"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Choose a unsername"
                  required
                />
              </div>

              <div>
                <label htmlFor="signupEmail" className="block mb-1 text-sm font-medium text-amber-300">
                  Email
                </label>
                <input
                  type="email"
                  id="signupEmail"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label htmlFor="signupFullname" className="block mb-1 text-sm font-medium text-amber-300">
                  Full name (optional)
                </label>
                <input
                  type="text"
                  id="signupFullname"
                  value={signupFullname}
                  onChange={(e) => setSignupFullname(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="signupPassword" className="block mb-1 text-sm font-medium text-amber-300">
                  Password
                </label>
                <input
                  type="password"
                  id="signupPassword"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Choose password"
                  required
                />
              </div>

              {signupError && (
                <p className="text-red-400 text-sm bg-red-900/40 p-2 rounded">{signupError}</p>
              )}

              {signupSuccess && (
                <p className="text-emerald-300 text-sm bg-emerald-900/40 p-2 rounded">{signupSuccess}</p>
              )}

              <button
                type="button"
                disabled={signupLoading}
                onClick={() => {
                  void submitSignup();
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-linear-to-r from-amber-800 to-amber-800 text-white font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupLoading ? "Creating account..." : "sign up"}
              </button>
            </form>
          </div>
        </div>
      )}
=======
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
        <RedirectToDashboard />
      </SignedIn>
>>>>>>> 2d98fb0 (SA)
    </div>
  );
}

// Separate component to handle redirect after sign in
<<<<<<< HEAD
// function RedirectToDashboard() {
//   const navigate = useNavigate();
// //Component renders → UI is ready → useEffect runs → navigate("/Dashboard")
//   useEffect(() => {
//     navigate("/Dashboard");
//   }, [navigate]);

//   return (
//     <p className="text-white text-xl">Redirecting to lobby...</p>
//   );
// }
=======
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
>>>>>>> 2d98fb0 (SA)

export default Login;
