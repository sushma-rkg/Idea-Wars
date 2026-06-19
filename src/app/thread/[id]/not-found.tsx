import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function NotFound() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="py-20 text-center">
      <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold">
        Thread not found
      </h1>
      <p className="mt-4 text-[var(--color-muted)]">
        This thread may have been removed or the link is invalid.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-black"
      >
        Go home
      </Link>
      {!user && (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          or{" "}
          <Link href="/auth" className="text-[var(--color-accent)] hover:underline">
            sign in
          </Link>
        </p>
      )}
    </div>
  );
}
