"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

const systemPrompt =
  "You are Lumina, a deeply knowledgeable AI guide. Answer clearly, cite your reasoning when helpful, and be proactive in offering extra context.";

const initialAssistantMessage: Message = {
  id: "assistant-initial",
  role: "assistant",
  content:
    "Hi, I’m Lumina. Ask me anything—from quick facts to deep dives—and I’ll take it from here.",
  createdAt: Date.now(),
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt - b.createdAt),
    [messages],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orderedMessages, pending]);

  const handleSubmit = async () => {
    if (!input.trim() || pending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    };

    const priorMessages = [...orderedMessages, userMessage];

    setMessages(priorMessages);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          messages: priorMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? `Request failed with ${response.status}`);
      }

      const payload: { message?: string } = await response.json();
      const trimmed = payload.message?.trim();

      if (!trimmed) {
        throw new Error("Empty response from the AI service.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: trimmed,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      const fallback =
        err instanceof Error ? err.message : "Unexpected error generating reply.";
      setError(fallback);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I ran into a technical issue and couldn’t complete that request. Please try again in a moment.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Lumina
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your full-spectrum AI research partner
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="hidden h-2 w-2 rounded-full bg-emerald-500 sm:block" />
            <span>Always on · Multidomain intelligence</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 pb-24 pt-10">
        <section
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-3xl border border-slate-900 bg-slate-950/60 p-6 shadow-[0_0_60px_-40px] shadow-emerald-400/30"
        >
          <ul className="flex flex-col gap-6">
            {orderedMessages.map((message) => (
              <li
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xl rounded-3xl px-5 py-4 text-sm leading-6 sm:text-base ${
                    message.role === "user"
                      ? "bg-emerald-500/80 text-slate-950 shadow-[0_0_30px_-10px] shadow-emerald-400/40"
                      : "bg-slate-900/80 text-slate-100 ring-1 ring-white/5"
                  }`}
                >
                  <div className="mb-2 text-xs uppercase tracking-wide text-slate-300">
                    {message.role === "user" ? "You" : "Lumina"}
                  </div>
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </li>
            ))}
            {pending && (
              <li className="flex justify-start">
                <div className="max-w-xl rounded-3xl bg-slate-900/80 px-5 py-4 text-sm leading-6 text-slate-300 ring-1 ring-white/5 sm:text-base">
                  <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                    Lumina
                  </div>
                  <p className="animate-pulse">Thinking…</p>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-900 bg-slate-950/80 p-6 shadow-[0_0_60px_-40px] shadow-emerald-400/30">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <textarea
              className="h-28 flex-1 resize-none rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 shadow-inner placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring focus:ring-emerald-500/30 sm:text-base"
              placeholder="Ask Lumina anything. For best results, be specific."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              required
              disabled={pending}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
              disabled={pending}
            >
              {pending ? "Sending…" : "Send"}
            </button>
          </form>
          {error && (
            <p className="text-sm text-rose-400">
              {error} <span className="text-slate-400">Retry when ready.</span>
            </p>
          )}
          <p className="text-xs text-slate-500">
            Lumina can synthesize facts, strategies, and creative concepts.
            Always double-check critical details.
          </p>
        </section>
      </main>
    </div>
  );
}
