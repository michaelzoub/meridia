import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase";
import ArticleEditor from "@/components/editor/ArticleEditor";

export const metadata: Metadata = { title: "Edit Article — Dashboard" };

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, subtitle, content, slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (!article) notFound();

  return (
    <ArticleEditor
      initialId={article.id as string}
      initialTitle={(article.title as string) ?? ""}
      initialSubtitle={(article.subtitle as string) ?? ""}
      initialContent={(article.content as string) ?? ""}
      initialSlug={(article.slug as string) ?? ""}
    />
  );
}
