import type { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import { deleteArticle } from "./actions";

export const metadata: Metadata = { title: "Writing Dashboard" };
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardWritingPage() {
  const supabase = createServiceClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, subtitle, slug, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          Meridia / Writing
        </p>
        <Link
          href="/dashboard/writing/new"
          className="border border-zinc-900 bg-zinc-900 px-4 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-zinc-700"
        >
          New article
        </Link>
      </header>

      <div className="px-6 py-8">
        {!articles || articles.length === 0 ? (
          <p className="font-sans text-sm text-zinc-500">
            No articles yet.{" "}
            <Link
              href="/dashboard/writing/new"
              className="text-cyan-700 underline underline-offset-4 hover:text-cyan-900"
            >
              Create your first one.
            </Link>
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Title
                </th>
                <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Status
                </th>
                <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Created
                </th>
                <th className="pb-3 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {articles.map((article) => (
                <tr key={article.id as string} className="group">
                  <td className="py-3 pr-6">
                    <span className="font-sans font-medium text-zinc-900">
                      {(article.title as string) || (
                        <span className="italic text-zinc-400">Untitled</span>
                      )}
                    </span>
                    {article.subtitle && (
                      <p className="mt-0.5 font-sans text-xs text-zinc-500 line-clamp-1">
                        {article.subtitle as string}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-6">
                    <span
                      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.12em] ${
                        article.published_at
                          ? "text-cyan-700"
                          : "text-zinc-400"
                      }`}
                    >
                      {article.published_at ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 pr-6 font-mono text-[11px] text-zinc-500">
                    {formatDate(article.created_at as string)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/writing/${article.id}`}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        Edit
                      </Link>
                      <form action={deleteArticle}>
                        <input
                          type="hidden"
                          name="id"
                          value={article.id as string}
                        />
                        <button
                          type="submit"
                          className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-400 transition-colors hover:text-red-700"
                          onClick={(e) => {
                            if (
                              !confirm(
                                "Delete this article? This cannot be undone."
                              )
                            )
                              e.preventDefault();
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
