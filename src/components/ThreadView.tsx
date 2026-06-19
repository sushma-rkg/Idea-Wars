"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Thread, Idea } from "@/lib/types";
import { isThreadEnded, formatTimeLeft } from "@/lib/types";
import { IdeaCard } from "./IdeaCard";

type ThreadViewProps = {
  thread: Thread;
  initialIdeas: Idea[];
  userId: string | null;
};

export function ThreadView({ thread, initialIdeas, userId }: ThreadViewProps) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [content, setContent] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);
  const [justPosted, setJustPosted] = useState(false);
  const [supabase] = useState(() => createClient());

  const ended = isThreadEnded(thread);
  const canPost = !!userId && !ended;
  const canVote = !!userId && !ended;

  useEffect(() => {
    if (!thread.ends_at) return;
    const tick = () => setTimeLeft(formatTimeLeft(thread.ends_at!));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [thread.ends_at]);

  useEffect(() => {
    if (ended) setShowLeaderboard(true);
  }, [ended]);

  const fetchIdeas = useCallback(async () => {
    const { data: ideasData } = await supabase
      .from("ideas")
      .select("*")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true });

    if (!ideasData) return;

    const { data: upvotesData } = await supabase
      .from("upvotes")
      .select("idea_id, user_id")
      .in(
        "idea_id",
        ideasData.map((i) => i.id)
      );

    const voteCounts = new Map<string, number>();
    const userVotes = new Set<string>();

    upvotesData?.forEach((v) => {
      voteCounts.set(v.idea_id, (voteCounts.get(v.idea_id) ?? 0) + 1);
      if (userId && v.user_id === userId) userVotes.add(v.idea_id);
    });

    setIdeas(
      ideasData.map((i) => ({
        ...i,
        upvote_count: voteCounts.get(i.id) ?? 0,
        has_upvoted: userVotes.has(i.id),
      }))
    );
  }, [supabase, thread.id, userId]);

  useEffect(() => {
    const channel = supabase
      .channel(`thread-${thread.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ideas", filter: `thread_id=eq.${thread.id}` },
        fetchIdeas
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "upvotes" },
        fetchIdeas
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, thread.id, fetchIdeas]);

  async function postIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !content.trim() || ended) return;
    setPosting(true);

    const { error } = await supabase.from("ideas").insert({
      thread_id: thread.id,
      user_id: userId,
      content: content.trim(),
    });

    setPosting(false);
    if (!error) {
      setContent("");
      setJustPosted(true);
      setTimeout(() => setJustPosted(false), 1200);
      await fetchIdeas();
    }
  }

  async function toggleUpvote(ideaId: string) {
    if (!userId || ended) return;
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    if (idea.has_upvoted) {
      await supabase
        .from("upvotes")
        .delete()
        .eq("idea_id", ideaId)
        .eq("user_id", userId);
    } else {
      await supabase.from("upvotes").insert({
        idea_id: ideaId,
        user_id: userId,
      });
    }

    await fetchIdeas();
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (b.upvote_count !== a.upvote_count) return b.upvote_count - a.upvote_count;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const displayIdeas = showLeaderboard ? sortedIdeas : ideas;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">
            {thread.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
            {thread.ends_at && (
              <span
                className={`rounded-full px-3 py-0.5 ${
                  ended
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "bg-[var(--color-surface-hover)]"
                }`}
              >
                {ended ? "Voting ended" : `⏱ ${timeLeft} left`}
              </span>
            )}
            <span>{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copyLink}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm transition hover:border-[var(--color-accent)]"
          >
            {copied ? "Copied!" : "Share link"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              showLeaderboard
                ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)]"
                : "border border-[var(--color-border)] hover:border-[var(--color-gold)]"
            }`}
          >
            {showLeaderboard ? "🏆 Leaderboard" : "Show leaderboard"}
          </motion.button>
        </div>
      </div>

      {canPost && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            boxShadow: justPosted
              ? "0 0 0 2px var(--color-accent), 0 0 24px var(--color-accent-soft)"
              : "none",
          }}
          transition={{ duration: 0.4 }}
          onSubmit={postIdea}
          className="glass rounded-2xl p-4"
        >
          <textarea
            placeholder="Share your idea..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[var(--color-muted)]">
              {content.length}/500
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={posting || !content.trim()}
              className="rounded-xl bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-black transition hover:brightness-110 disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post idea"}
            </motion.button>
          </div>
        </motion.form>
      )}

      {!userId && !ended && (
        <p className="text-center text-sm text-[var(--color-muted)]">
          <a href="/auth" className="text-[var(--color-accent)] hover:underline">
            Sign in
          </a>{" "}
          to post ideas and upvote
        </p>
      )}

      {showLeaderboard && ideas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 px-4 py-3 text-center text-sm text-[var(--color-gold)]"
        >
          🏆 Leaderboard — top ideas by upvotes
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {displayIdeas.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center text-[var(--color-muted)]"
            >
              No ideas yet. Be the first to share one!
            </motion.p>
          ) : (
            displayIdeas.map((idea, idx) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                rank={showLeaderboard ? idx + 1 : undefined}
                showRank={showLeaderboard}
                onUpvote={toggleUpvote}
                canVote={canVote}
              />
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
