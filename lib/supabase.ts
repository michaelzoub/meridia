import { createClient } from "@supabase/supabase-js";

export type Article = {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  slug: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Service-role client — server only, never import in client components. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServiceClient(): ReturnType<typeof createClient<any>> {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Anon client — safe for public server components (RLS enforced). */
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
