"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: "✨",
    title: "AI-Powered Writing",
    desc: "Improve clarity, tone, and engagement with one click. GPT-4o understands your context.",
  },
  {
    icon: "→",
    title: "Continue Writing",
    desc: "Stuck mid-sentence? Let AI pick up exactly where you left off — in your voice.",
  },
  {
    icon: "📝",
    title: "Instant Summaries",
    desc: "Turn long documents into crisp summaries in seconds. Great for briefs and TLDRs.",
  },
  {
    icon: "✓",
    title: "Grammar & Spelling",
    desc: "Catch every typo and grammatical slip before your reader does.",
  },
  {
    icon: "⚡",
    title: "Real-time Autosave",
    desc: "Never lose a word. Your work saves automatically as you type.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Your documents belong to you. End-to-end encryption, zero data selling.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      // Auto sign in after register
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please try logging in.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHub() {
    signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-sm font-bold">
            Q
          </div>
          <span className="text-lg font-semibold tracking-tight">Quill AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => signIn()}
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </button>
          <a
            href="#signup"
            className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
          >
            Try Free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-700/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Powered by GPT-4o
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Write{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                10x faster
              </span>
              <br />
              with AI
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-md">
              Quill AI helps writers, marketers, and teams produce polished content
              in minutes — not hours. Improve, continue, summarize, and fix your
              writing instantly.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="text-green-400">✓</span> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-green-400">✓</span> 10 free AI credits
              </span>
            </div>
          </div>

          {/* Signup card */}
          <div id="signup" className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-violet-950/30">
            <h2 className="text-xl font-semibold mb-1">Start writing for free</h2>
            <p className="text-sm text-gray-400 mb-6">No credit card. Cancel anytime.</p>

            <button
              onClick={handleGitHub}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 transition-colors rounded-lg py-3 text-sm font-medium mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-500">
                <span className="bg-gray-900 px-3">or sign up with email</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <input
                type="password"
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-lg py-3 text-sm font-semibold"
              >
                {loading ? "Creating account…" : "Create free account →"}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              Already have an account?{" "}
              <button
                onClick={() => signIn()}
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Everything you need to write better</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Four AI tools built into one distraction-free editor. Your workflow, supercharged.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-gray-900 hover:bg-gray-800/80 border border-white/5 hover:border-violet-500/30 rounded-xl p-6 transition-all"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2 group-hover:text-violet-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
            <p className="text-gray-400">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8">
              <div className="text-sm text-gray-400 font-medium mb-1">Free</div>
              <div className="text-4xl font-bold mb-1">
                $0<span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">Get started, no card needed.</p>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                {["10 AI credits total", "Unlimited documents", "All AI tools", "Autosave"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-violet-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#signup"
                className="block text-center bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg py-3 text-sm font-medium"
              >
                Get started free
              </a>
            </div>

            {/* Pro */}
            <div className="relative bg-gradient-to-b from-violet-900/50 to-gray-900 border border-violet-500/40 rounded-2xl p-8 shadow-lg shadow-violet-950/30">
              <div className="absolute -top-3 left-6">
                <span className="text-xs font-semibold bg-violet-600 text-white px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>
              <div className="text-sm text-violet-300 font-medium mb-1">Pro</div>
              <div className="text-4xl font-bold mb-1">
                $19<span className="text-lg font-normal text-gray-400">/mo</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">For serious writers and teams.</p>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                {[
                  "Unlimited AI credits",
                  "Unlimited documents",
                  "Priority AI responses",
                  "All Free features",
                  "Early access to new features",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-violet-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#signup"
                className="block text-center bg-violet-600 hover:bg-violet-500 transition-colors rounded-lg py-3 text-sm font-semibold"
              >
                Start Pro — $19/mo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-xs font-bold">
              Q
            </div>
            <span className="text-sm font-medium">Quill AI</span>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Quill AI. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
