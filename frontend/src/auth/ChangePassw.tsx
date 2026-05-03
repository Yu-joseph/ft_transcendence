import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordField } from "../components/PasswordField";

type ChangePassResponse = {
  error?: string | string[];
  message?: string;
};

function pickMessage(payload: ChangePassResponse | null, fallback: string): string {
  if (!payload) return fallback;

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

async function parseResponse(response: Response): Promise<ChangePassResponse | null> {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ChangePassResponse;
  } catch {
    return null;
  }
}

export default function ChangePassw() {
  const navigate = useNavigate();

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [retypeNewPass, setRetypeNewPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPass || !newPass || !retypeNewPass) {
      setError("All fields are required.");
      return;
    }

    if (newPass !== retypeNewPass) {
      setError("New passwords do not match.");
      return;
    }

    if (newPass === currentPass) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/authent/changepass/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_pass: currentPass,
          new_pass: newPass,
          retype_new_pass: retypeNewPass,
        }),
      });

      const payload = await parseResponse(response);

      if (response.status === 401) {
        setError("Session expired. Please sign in again.");
        setTimeout(() => navigate("/login"), 800);
        return;
      }

      if (!response.ok) {
        throw new Error(pickMessage(payload, "Failed to update password."));
      }

      setSuccess(pickMessage(payload, "Password updated successfully."));
      setCurrentPass("");
      setNewPass("");
      setRetypeNewPass("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-amber-400/20 bg-slate-900/80 p-6 shadow-2xl shadow-amber-900/20 backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-amber-300">Change Password</h1>
          <button
            type="button"
            onClick={() => navigate("/Profile")}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:border-amber-400 hover:text-amber-300"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="currentPass"
            label="Current Password"
            value={currentPass}
            onValueChange={setCurrentPass}
            placeholder="Enter current password"
            autoComplete="current-password"
          />

          <PasswordField
            id="newPass"
            label="New Password"
            value={newPass}
            onValueChange={setNewPass}
            placeholder="Enter new password"
            autoComplete="new-password"
            showStrength
          />

          <PasswordField
            id="retypeNewPass"
            label="Retype New Password"
            value={retypeNewPass}
            onValueChange={setRetypeNewPass}
            placeholder="Retype new password"
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
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}