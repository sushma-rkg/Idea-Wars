"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Idea } from "@/lib/types";

type IdeaCardProps = {
  idea: Idea;
  rank?: number;
  showRank?: boolean;
  onUpvote: (ideaId: string) => void;
  canVote: boolean;
};

export function IdeaCard({
  idea,
  rank,
  showRank,
  onUpvote,
  canVote,
}: IdeaCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="glass group flex gap-4 rounded-2xl p-4"
    >
      {showRank && rank !== undefined && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-syne)] text-lg font-bold ${
            rank === 1
              ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)]"
              : rank === 2
                ? "bg-gray-400/20 text-gray-300"
                : rank === 3
                  ? "bg-orange-700/20 text-orange-400"
                  : "bg-[var(--color-surface-hover)] text-[var(--color-muted)]"
          }`}
        >
          {rank}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">{idea.content}</p>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          {new Date(idea.created_at).toLocaleString()}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => canVote && onUpvote(idea.id)}
        disabled={!canVote}
        className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition ${
          idea.has_upvoted
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            : "hover:bg-[var(--color-surface-hover)] text-[var(--color-muted)]"
        } ${!canVote ? "cursor-default opacity-60" : "cursor-pointer"}`}
      >
        <motion.span
          key={idea.upvote_count}
          initial={{ scale: 1.4, color: "var(--color-accent)" }}
          animate={{ scale: 1 }}
          className="text-lg leading-none"
        >
          ▲
        </motion.span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={idea.upvote_count}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-sm font-semibold tabular-nums"
          >
            {idea.upvote_count}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
