import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThreadView } from "@/components/ThreadView";
import type { Idea, Thread } from "@/lib/types";

async function getThreadIdeas(
  threadId: string,
  userId: string | null
): Promise<Idea[]> {
  const supabase = await createClient();

  const { data: ideasData } = await supabase
    .from("ideas")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (!ideasData?.length) return [];

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

  return ideasData.map((i) => ({
    ...i,
    upvote_count: voteCounts.get(i.id) ?? 0,
    has_upvoted: userVotes.has(i.id),
  }));
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: thread } = await supabase
    .from("threads")
    .select("*")
    .eq("id", id)
    .single();

  if (!thread) notFound();

  const ideas = await getThreadIdeas(id, user?.id ?? null);

  return (
    <ThreadView
      thread={thread as Thread}
      initialIdeas={ideas}
      userId={user?.id ?? null}
    />
  );
}
