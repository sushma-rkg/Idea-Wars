import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateThreadForm } from "@/components/AuthForm";
import type { Thread } from "@/lib/types";
import { TIMER_LABELS } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: threads } = await supabase
    .from("threads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight sm:text-5xl">
          Battle of <span className="text-[var(--color-accent)]">Ideas</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--color-muted)]">
          Start a thread, share ideas, upvote the best ones, and crown a winner
          on the leaderboard.
        </p>
      </section>

      {user ? (
        <CreateThreadForm userId={user.id} />
      ) : (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-[var(--color-muted)]">
            <Link href="/auth" className="text-[var(--color-accent)] hover:underline">
              Sign in
            </Link>{" "}
            to start a new thread
          </p>
        </div>
      )}

      <section>
        <h2 className="mb-4 font-[family-name:var(--font-syne)] text-lg font-semibold">
          Recent threads
        </h2>
        {!threads?.length ? (
          <p className="text-sm text-[var(--color-muted)]">No threads yet.</p>
        ) : (
          <ul className="space-y-3">
            {(threads as Thread[]).map((thread) => (
              <li key={thread.id}>
                <Link
                  href={`/thread/${thread.id}`}
                  className="glass block rounded-2xl p-4 transition hover:border-[var(--color-accent)]/50"
                >
                  <span className="font-medium">{thread.title}</span>
                  <span className="mt-1 block text-xs text-[var(--color-muted)]">
                    {TIMER_LABELS[thread.timer_minutes]} ·{" "}
                    {new Date(thread.created_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
