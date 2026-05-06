import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-blue-900/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">Legal</p>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="mt-2 text-sm text-slate-300">
              The rules that keep Tic-Tac-Toe Arena fun, fair, and safe.
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
              <h2 className="text-lg font-semibold text-amber-400">Acceptance</h2>
              <p className="mt-2">
                By accessing or using Tic-Tac-Toe Arena, you agree to these Terms of Service and
                to comply with all applicable laws and regulations.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Eligibility and accounts</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>You must meet the minimum age required by your local law to use the service.</li>
                <li>Provide accurate account information and keep your credentials secure.</li>
                <li>You are responsible for activity that happens under your account.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Fair play and conduct</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>No cheating, automation, or scripts that give unfair advantages in matches.</li>
                <li>No harassment, hate speech, or abusive behavior in chat or profiles.</li>
                <li>No attempts to disrupt servers, bypass security, or access other accounts.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">User content</h2>
              <p className="mt-2">
                You retain ownership of content you submit, including text chat messages and
                profile content. You grant us a license to host, store, display, and distribute
                that content as needed to operate the service.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Tournaments and matches</h2>
              <p className="mt-2">
                Match results, rankings, and tournament outcomes may be recorded and displayed to
                other players. Tournaments are offered in fixed sizes (4/8/16) and require at least
                3 players to start. Administrators may review activity to enforce fair play.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Service availability</h2>
              <p className="mt-2">
                We may update, suspend, or discontinue features at any time. We strive for uptime,
                but the service may be unavailable due to maintenance or unexpected issues.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Service limitations</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>Chat is text-only (no file or image sharing).</li>
                <li>No spectator mode for ongoing matches.</li>
                <li>No two-factor authentication (2FA).</li>
                <li>Local/dev environments use self-signed TLS certificates.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Termination</h2>
              <p className="mt-2">
                We may suspend or terminate access if these terms are violated. You can stop using
                the service at any time.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Disclaimers</h2>
              <p className="mt-2">
                The service is provided on an "as is" and "as available" basis. We do not guarantee
                that the service will be error free or uninterrupted.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Limitation of liability</h2>
              <p className="mt-2">
                To the fullest extent permitted by law, we are not liable for indirect, incidental,
                or consequential damages arising from your use of the service.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Changes</h2>
              <p className="mt-2">
                We may update these terms from time to time. Continued use of the service means you
                accept the updated terms.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-amber-400">Contact</h2>
              <p className="mt-2">
                For questions about these terms, contact the administrators through the app or the
                official support channel. You can also reach the team on Discord.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
