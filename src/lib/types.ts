export type Thread = {
  id: string;
  title: string;
  created_by: string;
  timer_minutes: 0 | 5 | 10;
  created_at: string;
  ends_at: string | null;
};

export type Idea = {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
  upvote_count: number;
  has_upvoted: boolean;
};

export type TimerOption = 0 | 5 | 10;

export const TIMER_LABELS: Record<TimerOption, string> = {
  0: "No timer",
  5: "5 minutes",
  10: "10 minutes",
};

export function isThreadEnded(thread: Thread): boolean {
  if (!thread.ends_at) return false;
  return new Date(thread.ends_at) <= new Date();
}

export function formatTimeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
