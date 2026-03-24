"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type AIAction = "improve" | "continue" | "summarize" | "fix_grammar";

const AI_TOOLS: { action: AIAction; label: string; icon: string }[] = [
  { action: "improve", label: "Improve", icon: "✨" },
  { action: "continue", label: "Continue writing", icon: "→" },
  { action: "summarize", label: "Summarize", icon: "📝" },
  { action: "fix_grammar", label: "Fix grammar", icon: "✓" },
];

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState("free");
  const [aiLoading, setAiLoading] = useState<AIAction | null>(null);
  const [aiError, setAiError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef({ title: "", content: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadDoc();
    loadCredits();
    setPlan((session?.user as any)?.plan ?? "free");
  }, [status, docId]);

  async function loadDoc() {
    const res = await fetch(`/api/documents/${docId}`);
    if (!res.ok) {
      router.replace("/dashboard");
      return;
    }
    const data = await res.json();
    setTitle(data.document.title);
    setContent(data.document.content);
    lastSaved.current = { title: data.document.title, content: data.document.content };
  }

  async function loadCredits() {
    try {
      const res = await fetch("/api/user/credits");
      if (!res.ok) return;
      const data = await res.json();
      setCredits(data.credits);
    } catch {
      // non-critical
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [content]);

  const save = useCallback(
    async (newTitle: string, newContent: string) => {
      if (
        newTitle === lastSaved.current.title &&
        newContent === lastSaved.current.content
      ) {
        return;
      }

      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/documents/${docId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, content: newContent }),
        });

        if (res.ok) {
          lastSaved.current = { title: newTitle, content: newContent };
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    },
    [docId]
  );

  // Debounced save on content / title change
  function schedulesSave(newTitle: string, newContent: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save(newTitle, newContent);
    }, 2000);
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    schedulesSave(val, content);
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    schedulesSave(title, val);
  }

  async function runAI(action: AIAction) {
    if (!content.trim()) {
      setAiError("Add some text first.");
      return;
    }

    setAiError("");
    setAiLoading(action);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error ?? "AI request failed");
        return;
      }

      // For fix_grammar and improve, replace; for continue and summarize, append
      if (action === "fix_grammar" || action === "improve") {
        setContent(data.result);
        schedulesSave(title, data.result);
      } else if (action === "continue") {
        const updated = content.trimEnd() + "\n\n" + data.result;
        setContent(updated);
        schedulesSave(title, updated);
      } else if (action === "summarize") {
        const updated = content + "\n\n---\nSummary:\n" + data.result;
        setContent(updated);
        schedulesSave(title, updated);
      }

      if (data.creditsRemaining !== null && data.creditsRemaining !== undefined) {
        setCredits(data.creditsRemaining);
      }
    } catch {
      setAiError("Network error.");
    } finally {
      setAiLoading(null);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/5 px-5 py-3 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center gap-1.5"
        >
          ← Dashboard
        </button>

        <div className="w-px h-4 bg-white/10" />

        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="flex-1 bg-transparent text-sm font-medium text-gray-200 placeholder-gray-600 focus:outline-none max-w-sm"
          placeholder="Untitled"
        />

        <div className="ml-auto flex items-center gap-4">
          {/* Save status */}
          <span
            className={`text-xs transition-colors ${
              saveStatus === "saving"
                ? "text-gray-400"
                : saveStatus === "saved"
                ? "text-green-400"
                : saveStatus === "error"
                ? "text-red-400"
                : "text-transparent"
            }`}
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
              ? "Saved"
              : saveStatus === "error"
              ? "Save failed"
              : "·"}
          </span>

          {/* Credits */}
          {plan === "free" && credits !== null && (
            <div className="text-xs text-gray-500">
              <span className="text-violet-400 font-medium">{credits}</span> credits
            </div>
          )}
          {plan === "pro" && (
            <span className="text-xs text-violet-400">Pro</span>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 overflow-y-auto px-6 py-10 lg:px-16 xl:px-28">
          <div className="max-w-2xl mx-auto">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing… or use an AI tool on the right to get going."
              className="w-full bg-transparent text-gray-200 placeholder-gray-700 text-base leading-8 resize-none focus:outline-none min-h-[60vh]"
              style={{ overflow: "hidden" }}
            />
          </div>
        </div>

        {/* AI Sidebar */}
        <aside className="w-56 flex-shrink-0 border-l border-white/5 bg-gray-900/50 px-4 py-6 flex flex-col gap-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            AI Tools
          </p>

          {AI_TOOLS.map(({ action, label, icon }) => (
            <button
              key={action}
              onClick={() => runAI(action)}
              disabled={aiLoading !== null}
              className="flex items-center gap-2.5 w-full bg-gray-800 hover:bg-violet-600/20 hover:border-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 rounded-lg px-3 py-2.5 text-sm transition-all text-left"
            >
              {aiLoading === action ? (
                <span className="w-4 h-4 border border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <span className="text-base leading-none flex-shrink-0">{icon}</span>
              )}
              <span className={aiLoading === action ? "text-violet-300" : "text-gray-300"}>
                {aiLoading === action ? "Working…" : label}
              </span>
            </button>
          ))}

          {aiError && (
            <div className="mt-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 leading-relaxed">
              {aiError}
            </div>
          )}

          {plan === "free" && credits !== null && (
            <div className="mt-auto pt-4 border-t border-white/5">
              <p className="text-xs text-gray-600 mb-1">Credits remaining</p>
              <div className="flex items-center gap-1">
                <div
                  className="h-1.5 rounded-full bg-violet-600 transition-all"
                  style={{ width: `${Math.max(0, (credits / 10) * 100)}%` }}
                />
                <div
                  className="h-1.5 rounded-full bg-gray-800 flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {credits}/10 left
                {credits === 0 && (
                  <span className="block text-amber-400 mt-1">Upgrade to Pro for unlimited</span>
                )}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
