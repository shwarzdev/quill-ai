"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Document = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchDocs();
    fetchCredits();
  }, [status]);

  async function fetchDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocs(data.documents ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCredits() {
    try {
      const res = await fetch("/api/user/credits");
      if (!res.ok) return;
      const data = await res.json();
      setCredits(data.credits);
    } catch {
      // non-critical, ignore
    }
  }

  async function createDoc() {
    setCreating(true);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      const data = await res.json();
      if (data.document?.id) {
        router.push(`/editor/${data.document.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteDoc(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const user = session?.user;
  const plan = (user as any)?.plan ?? "free";

  if (status === "loading" || (status === "unauthenticated")) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-sm font-bold">
              Q
            </div>
            <span className="text-base font-semibold tracking-tight">Quill AI</span>
          </div>

          <div className="flex items-center gap-4">
            {plan === "free" && credits !== null && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 rounded-full px-3 py-1.5">
                <span className="text-violet-400 font-medium">{credits}</span>
                <span>AI credits left</span>
                {credits === 0 && (
                  <span className="ml-1 text-amber-400">— upgrade to Pro</span>
                )}
              </div>
            )}
            {plan === "pro" && (
              <div className="text-xs text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-3 py-1.5">
                Pro
              </div>
            )}

            <div className="flex items-center gap-3">
              {user?.image ? (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-xs font-semibold">
                  {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="text-sm text-gray-300 hidden sm:block">
                {user?.name ?? user?.email}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your documents</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {docs.length} {docs.length === 1 ? "document" : "documents"}
            </p>
          </div>
          <button
            onClick={createDoc}
            disabled={creating}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            {creating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>+</span>
            )}
            New Document
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first one to get started.</p>
            <button
              onClick={createDoc}
              disabled={creating}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-60 transition-colors rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              {creating ? "Creating…" : "Create document"}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="group relative bg-gray-900 hover:bg-gray-800/80 border border-white/5 hover:border-violet-500/30 rounded-xl p-5 cursor-pointer transition-all"
                onClick={() => router.push(`/editor/${doc.id}`)}
              >
                <h3 className="font-medium mb-2 group-hover:text-violet-300 transition-colors truncate pr-6">
                  {doc.title || "Untitled"}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem]">
                  {doc.content
                    ? doc.content.slice(0, 100) + (doc.content.length > 100 ? "…" : "")
                    : "No content yet"}
                </p>
                <div className="text-xs text-gray-600">
                  Updated {formatDate(doc.updatedAt)}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDoc(doc.id);
                  }}
                  disabled={deletingId === doc.id}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all disabled:opacity-50 text-lg leading-none"
                  title="Delete document"
                >
                  {deletingId === doc.id ? (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    "×"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
