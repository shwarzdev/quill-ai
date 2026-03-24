import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Action = "improve" | "continue" | "summarize" | "fix_grammar";

const SYSTEM_PROMPTS: Record<Action, string> = {
  improve: "Improve this text to be clearer and more engaging. Return only the improved text.",
  continue: "Continue writing this text naturally. Return only the continuation (2-3 paragraphs max).",
  summarize: "Summarize this text concisely. Return only the summary.",
  fix_grammar: "Fix grammar and spelling errors. Return only the corrected text.",
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { action, text, context } = body;

  if (!action || !text) {
    return NextResponse.json({ error: "action and text are required" }, { status: 400 });
  }

  if (!SYSTEM_PROMPTS[action as Action]) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Free plan credit check
  if (user.plan === "free" && user.aiCredits <= 0) {
    return NextResponse.json(
      { error: "No AI credits remaining. Upgrade to Pro for unlimited usage." },
      { status: 402 }
    );
  }

  const userContent = context ? `Context: ${context}\n\n${text}` : text;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS[action as Action] },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const result = completion.choices[0]?.message?.content ?? "";

  // Decrement credits for free users
  if (user.plan === "free") {
    await db.user.update({
      where: { id: userId },
      data: { aiCredits: { decrement: 1 } },
    });
  }

  // Return updated credit count so the client can refresh
  const updatedCredits = user.plan === "free" ? user.aiCredits - 1 : null;

  return NextResponse.json({ result, creditsRemaining: updatedCredits });
}
