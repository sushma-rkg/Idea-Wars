"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { TimerOption } from "@/lib/types";
import { TIMER_LABELS } from "@/lib/types";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (isSignUp) {
      setMessage("Check your email to confirm your account.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mx-auto max-w-md rounded-2xl p-8"
    >
      <h1 className="mb-2 font-[family-name:var(--font-syne)] text-2xl font-bold">
        {isSignUp ? "Create account" : "Welcome back"}
      </h1>
      <p className="mb-6 text-sm text-[var(--color-muted)]">
        Email-only auth powered by Supabase
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-accent)] py-3 font-medium text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "..." : isSignUp ? "Sign up" : "Sign in"}
        </motion.button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
          {message}
        </p>
      )}

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setMessage("");
        }}
        className="mt-4 w-full text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Need an account? Sign up"}
      </button>
    </motion.div>
  );
}

export function CreateThreadForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [timer, setTimer] = useState<TimerOption>(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const endsAt =
      timer > 0
        ? new Date(Date.now() + timer * 60 * 1000).toISOString()
        : null;

    const { data, error } = await supabase
      .from("threads")
      .insert({
        title: title.trim(),
        created_by: userId,
        timer_minutes: timer,
        ends_at: endsAt,
      })
      .select("id")
      .single();

    setLoading(false);
    if (error || !data) return;

    router.push(`/thread/${data.id}`);
    router.refresh();
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6"
    >
      <h2 className="mb-4 font-[family-name:var(--font-syne)] text-lg font-semibold">
        Start a new thread
      </h2>
      <input
        type="text"
        placeholder="What's the discussion about?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={120}
        className="mb-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {([0, 5, 10] as TimerOption[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTimer(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              timer === t
                ? "bg-[var(--color-accent)] text-black"
                : "border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
            }`}
          >
            {TIMER_LABELS[t]}
          </button>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={loading}
        className="rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create thread"}
      </motion.button>
    </motion.form>
  );
}
