"use client";

import { deleteArticle } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteArticle}
      onSubmit={(e) => {
        if (!confirm("Delete this article? This cannot be undone."))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-400 transition-colors hover:text-red-700"
      >
        Delete
      </button>
    </form>
  );
}
