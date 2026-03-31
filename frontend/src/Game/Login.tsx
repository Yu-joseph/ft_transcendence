// import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCustomAuth } from "../hooks/useCustomAuth";

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
  const { isSignedIn, isLoaded } = useCustomAuth();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Checking session...
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/Dashboard" replace />;
  }

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

  const submitLogin = async () => {
    setError(null);
    setLoading(true);

    try {
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

      // Store user object directly when backend returns it.
      if (data.user && typeof data.user === "object") {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      }

      // Redirect to dashboard
      navigate("/Dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitLogin();
  };

  const handleLoginClick = () => {
    void submitLogin();
  };

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

  const handleSignupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitSignup();
  };
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
        <span className="bg-linear-to-r from-amber-500 to-indigo-500 bg-clip-text text-transparent">
          Game
        </span>
      </h1>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
        <p className="text-white text-xl">Please sign in to play.</p>

        <form className="w-full space-y-4" onSubmit={handleLoginSubmit}>
          {/* Email or Username */}
          <div>
            <label htmlFor="emailOrUsername" className="block mb-2 text-sm font-medium text-amber-300">
              Email or Username
            </label>
            <input
              type="text"
              id="emailOrUsername"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter email or username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-amber-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm bg-red-900 bg-opacity-30 p-2 rounded">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleLoginClick}
            className="w-full py-2.5 px-4 rounded-lg bg-linear-to-r from-green-700 to-amber-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              Sign up
            </button>
          </p>
        </form>
      </div>

      {showSignup && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
          onClick={() => setShowSignup(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-slate-800 p-5 border border-slate-700"
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
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                className="w-full py-2.5 px-4 rounded-lg bg-linear-to-r from-blue-700 to-cyan-500 text-amber-500 font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupLoading ? "Creating account..." : "sign up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component to handle redirect after sign in
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

export default Login;
