import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-blue-900/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">Legal</p>
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="mt-2 text-sm text-slate-300">
              How Tic-Tac-Toe Arena collects, uses, and protects information.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/Dashboard")}
            className="inline-flex items-center justify-center rounded-xl border border-amber-400/40 bg-slate-900 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
          >
            Back
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40">
          <p className="text-sm text-slate-400">Effective date: May 5, 2026</p>
          <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-200 sm:text-base">
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Overview</h2>
              <p className="mt-2">
                This policy explains what information we collect when you use Tic-Tac-Toe Arena,
                why we collect it, and how we keep it safe. By using the service, you agree to
                this policy.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Information we collect</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>
                  <span className="font-semibold text-slate-100">Account details:</span> username,
                  email, profile name, avatar, and authentication data.
                </li>
                <li>
                  <span className="font-semibold text-slate-100">Gameplay data:</span> match results,
                  tournament participation, rankings, and match history.
                </li>
                <li>
                  <span className="font-semibold text-slate-100">Chat and content:</span> text chat
                  messages and profile content you share with other players.
                </li>
                <li>
                  <span className="font-semibold text-slate-100">Technical data:</span> IP address,
                  browser type, and security logs used for rate limiting and troubleshooting.
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">How we use information</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>Run core gameplay features, matchmaking, tournaments, and chat.</li>
                <li>Authenticate users, prevent fraud, and maintain fair play.</li>
                <li>Provide support, troubleshoot issues, and communicate updates.</li>
                <li>Maintain service reliability, security, and performance.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Sharing and disclosure</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>With service providers that host or secure the platform.</li>
                <li>With other players, such as your username, avatar, and match results.</li>
                <li>When required by law or to protect the safety of players and the service.</li>
                <li>With your consent or at your direction.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Data retention</h2>
              <p className="mt-2">
                We retain information for as long as your account is active or as needed to provide
                the service, resolve disputes, and meet legal obligations.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Security</h2>
              <p className="mt-2">
                We use reasonable safeguards such as TLS, security headers, WAF protections, and
                rate limiting, but no system is completely secure. Please keep your credentials
                confidential. We do not offer two-factor authentication.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Your choices</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>Update profile details in the app when available.</li>
                <li>Contact the team if you want to access or delete your account data.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Changes</h2>
              <p className="mt-2">
                We may update this policy from time to time. We will post the latest version in the
                app with a new effective date.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Contact</h2>
              <p className="mt-2">
                Questions about privacy? Reach out through the app or contact the team on Discord.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
