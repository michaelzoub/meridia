import type { Metadata } from "next";
import ArticleEditor from "@/components/editor/ArticleEditor";

export const metadata: Metadata = { title: "New Article — Dashboard" };

export default function NewArticlePage() {
  return <ArticleEditor />;
}
