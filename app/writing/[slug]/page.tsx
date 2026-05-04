import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Container } from "@/components/ui";
import { ArticleHtmlBody } from "@/components/writing/ArticleHtmlBody";
import { getWritingPostBySlug } from "@/lib/writing/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getWritingPostBySlug(slug);
  if (!post) {
    return { title: "Not found | Caliga" };
  }
  return {
    title: `${post.title} | Caliga`,
    description: post.excerpt,
    ...(post.coverImageUrl && {
      openGraph: {
        images: [{ url: post.coverImageUrl, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        images: [post.coverImageUrl],
      },
    }),
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getWritingPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="border-b border-zinc-200 py-16 md:py-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {post.publishedAt}
          </p>
          <h1 className="mt-3 max-w-3xl font-sans text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="mt-4 max-w-2xl font-serif-display text-lg leading-relaxed text-zinc-700">
              {post.subtitle}
            </p>
          )}

          {post.coverImageUrl ? (
            <div className="mt-10 max-w-3xl border border-zinc-200 bg-zinc-50">
              {/* eslint-disable-next-line @next/next/no-img-element -- public Supabase storage URL */}
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="max-h-[min(70vh,520px)] w-full object-cover"
              />
            </div>
          ) : null}

          <ArticleHtmlBody
            html={post.content}
            className={`prose prose-zinc prose-lg max-w-3xl ${post.coverImageUrl ? "mt-10" : "mt-14"}`}
          />

          {post.writtenBy ? (
            <p className="mt-12 max-w-3xl border-t border-zinc-200 pt-8 font-serif-display text-sm text-zinc-600">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                Written by{" "}
              </span>
              <span className="text-zinc-900">{post.writtenBy}</span>
            </p>
          ) : null}

          <p className="mt-14">
            <Link
              href="/writing"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-800 transition-colors hover:text-cyan-950"
            >
              ← All writing
            </Link>
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
