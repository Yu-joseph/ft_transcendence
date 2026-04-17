import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordField } from "../components/PasswordField";

type ChangeIntraResponse = {
  error?: string | string[];
  message?: string;
};

// Selects a readable error/success message from the API response.
function pickMessage(payload: ChangeIntraResponse | null, fallback: string): string {
  if (!payload) 
    return fallback;

  const value = payload.error ?? payload.message;

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(" ");
    if (joined.trim()) return joined.trim();
  }

  return fallback;
}

// Parses the response body into JSON when possible.
async function parseResponse(response: Response): Promise<ChangeIntraResponse | null> {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ChangeIntraResponse;
  } catch {
    return null;
  }
}

// Renders the intra password setup form and handles submission flow.
export default function ChangeIntra() {
  // Shared flag so ProtectedRoute can lock the app to /changeps for intra users.
  const storageKey = "intra_password_required";
  const navigate = useNavigate();
  const [newPass, setNewPass] = useState("");
  const [retypePass, setRetypePass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear the intra gate once password setup is done or session is invalid.
  const clearIntraGate = () => localStorage.removeItem(storageKey);

  useEffect(() => {
    // Mark this session as intra and require password setup.
    localStorage.setItem(storageKey, "1");
  }, [storageKey]);

  // Validates input and posts the new password to the intra endpoint.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPass || !retypePass) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPass !== retypePass) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/authent/42/password/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPass }),
      });

      const payload = await parseResponse(response);

      if (response.status === 401) {
        setError("Session expired. Please sign in again.");
        clearIntraGate();
        setTimeout(() => navigate("/login"), 800);
        return;
      }

      if (response.status === 403) {
        setSuccess(pickMessage(payload, "Password already set. Redirecting to dashboard."));
        clearIntraGate();
        setTimeout(() => navigate("/Dashboard"), 900);
        return;
      }

      if (!response.ok) {
        throw new Error(pickMessage(payload, "Failed to set password."));
      }

      setSuccess(pickMessage(payload, "Password saved. Welcome back!"));
      setNewPass("");
      setRetypePass("");
      clearIntraGate();
      setTimeout(() => navigate("/Dashboard"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-10 text-white">
      <div className="relative mx-auto mt-8 w-full max-w-xl rounded-2xl border border-amber-400/20 bg-slate-900/80 p-6 shadow-2xl shadow-amber-900/20 backdrop-blur">
        <div className="mb-5 space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Intra access</p>
          <h1 className="text-3xl font-serif font-semibold text-amber-300">Set a Password</h1>
          <p className="text-sm text-slate-200">
            This step is required for Intra accounts. Add a password now to sign in without 42 next time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="newPass"
            label="New Password"
            value={newPass}
            onValueChange={setNewPass}
            placeholder="Create a new password"
            autoComplete="new-password"
            showStrength
          />

          <PasswordField
            id="retypePass"
            label="Confirm Password"
            value={retypePass}
            onValueChange={setRetypePass}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-900/40 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-linear-to-r from-amber-600 to-amber-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Password"}
          </button>
        </form>
      </div>
    </div>
  );
}