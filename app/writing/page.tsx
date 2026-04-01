import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Container, SectionLabel } from "@/components/ui";
import { getWritingPosts } from "@/lib/writing/queries";
import { SOCIAL_X_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing | ADHD Capital",
  description:
    "Essays, memos, and notes from the ADHD Capital research desk—crypto, fintech, deep tech, and anything in between.",
};

/** Always render on the server so database-backed content is included in the HTML payload. */
export const dynamic = "force-dynamic";

export default async function WritingPage() {
  const posts = await getWritingPosts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="border-b border-zinc-200 py-16 md:py-24">
          <SectionLabel>Writing</SectionLabel>
          <h1 className="mt-2 max-w-2xl font-sans text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Research notes and memos
          </h1>
          <p className="mt-4 max-w-xl font-serif-display text-base leading-relaxed text-zinc-700">
            Longer-form work from the desk—sourced, reproducible, and written to be forked.
          </p>

          <ul className="mt-12 divide-y divide-zinc-200 border-t border-zinc-200">
            {posts.length === 0 ? (
              <li className="py-10 font-serif-display text-zinc-600">
                Nothing published here yet. Follow{" "}
                <a
                  href={SOCIAL_X_URL}
                  className="text-cyan-800 underline decoration-cyan-800/30 underline-offset-4 hover:decoration-cyan-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @CapitalADHD
                </a>{" "}
                for updates.
              </li>
            ) : (
              posts.map((post) => (
                <li key={post.slug} className="py-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {post.publishedAt}
                  </p>
                  <h2 className="mt-2 font-sans text-xl font-semibold text-zinc-900 md:text-2xl">
                    <Link
                      href={`/writing/${post.slug}`}
                      className="transition-colors hover:text-cyan-800"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-2xl font-serif-display text-sm leading-relaxed text-zinc-700 md:text-base">
                    {post.excerpt}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Container>
      </main>
      <Footer />
    </>
  );
}
