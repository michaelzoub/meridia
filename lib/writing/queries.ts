import "server-only";
import { createAnonClient } from "@/lib/supabase";

export type WritingPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  /** Same as subtitle — kept for backwards compat with existing writing page */
  excerpt: string;
  content: string;
  /** Formatted date string for display */
  publishedAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getWritingPosts(): Promise<WritingPost[]> {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, subtitle, slug, published_at, content")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (!data) return [];

  return data.map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    subtitle: (row.subtitle as string | null) ?? null,
    excerpt: (row.subtitle as string) ?? "",
    content: (row.content as string) ?? "",
    publishedAt: formatDate(row.published_at as string),
  }));
}

export async function getWritingPostBySlug(slug: string): Promise<WritingPost | null> {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, subtitle, slug, published_at, content")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id as string,
    slug: data.slug as string,
    title: data.title as string,
    subtitle: (data.subtitle as string | null) ?? null,
    excerpt: (data.subtitle as string) ?? "",
    content: (data.content as string) ?? "",
    publishedAt: formatDate(data.published_at as string),
  };
}
