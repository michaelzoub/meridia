import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Login" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function DashboardLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          Caliga / Dashboard
        </p>
        <h1 className="mb-6 font-sans text-2xl font-semibold text-zinc-900">
          Access dashboard
        </h1>

        <form action="/api/auth/dashboard" method="POST" className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full border border-zinc-300 bg-white px-3 py-2.5 font-sans text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900"
            />
          </div>

          {error && (
            <p className="font-mono text-[11px] text-red-600">
              Invalid password. Try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full border border-zinc-900 bg-zinc-900 px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
