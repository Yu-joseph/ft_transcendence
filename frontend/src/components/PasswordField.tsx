import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: "current-password" | "new-password";
  error?: string;
  showStrength?: boolean;
};

type StrengthLevel = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): StrengthLevel {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 4) return "strong";
  if (score >= 3) return "medium";
  return "weak";
}

export function PasswordField({
  id,
  label,
  value,
  onValueChange,
  placeholder = "Enter password",
  required = true,
  autoComplete = "new-password",
  error,
  showStrength = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const strength = useMemo(() => getPasswordStrength(value), [value]);

  const strengthColor =
    strength === "strong"
      ? "bg-emerald-500"
      : strength === "medium"
      ? "bg-amber-500"
      : "bg-rose-500";

  const strengthWidth =
    strength === "strong" ? "100%" : strength === "medium" ? "66%" : "33%";

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-amber-200">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="w-full rounded-lg bg-slate-800 px-3 py-2.5 pr-11 text-white outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-amber-400"
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide " + label : "Show " + label}
          className="absolute inset-y-0 right-0 px-3 text-slate-300 hover:text-amber-300"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="h-2 w-full overflow-hidden rounded bg-slate-700">
            <div
              className={"h-full transition-all duration-300 " + strengthColor}
              style={{ width: strengthWidth }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Strength: <span className="capitalize">{strength}</span>
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 rounded border border-rose-500/40 bg-rose-900/40 px-2 py-1 text-xs text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}