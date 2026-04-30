"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dashboard_token")?.value;
  if (token !== process.env.DASHBOARD_SECRET) {
    redirect("/dashboard/login");
  }
}

export async function saveDraft(data: {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  slug: string;
}): Promise<string | null> {
  await requireAuth();
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  if (data.id) {
    await supabase
      .from("articles")
      .update({
        title: data.title,
        subtitle: data.subtitle || null,
        content: data.content,
        slug: data.slug,
        published_at: null,
        updated_at: now,
      })
      .eq("id", data.id);
    revalidatePath("/dashboard/writing");
    return data.id;
  }

  const { data: inserted } = await supabase
    .from("articles")
    .insert({
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      slug: data.slug,
      published_at: null,
    })
    .select("id")
    .single();

  revalidatePath("/dashboard/writing");
  return (inserted as { id: string } | null)?.id ?? null;
}

export async function publishArticle(data: {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  slug: string;
}): Promise<{ redirectTo: string }> {
  await requireAuth();
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  let id = data.id;

  if (id) {
    await supabase
      .from("articles")
      .update({
        title: data.title,
        subtitle: data.subtitle || null,
        content: data.content,
        slug: data.slug,
        published_at: now,
        updated_at: now,
      })
      .eq("id", id);
  } else {
    const { data: inserted } = await supabase
      .from("articles")
      .insert({
        title: data.title,
        subtitle: data.subtitle || null,
        content: data.content,
        slug: data.slug,
        published_at: now,
      })
      .select("id")
      .single();
    id = (inserted as { id: string } | null)?.id;
  }

  revalidatePath("/writing");
  revalidatePath("/dashboard/writing");
  return { redirectTo: `/dashboard/writing/${id}/publish-success` };
}

export async function deleteArticle(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  if (!id) return;
  const supabase = createServiceClient();
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/dashboard/writing");
  revalidatePath("/writing");
}
