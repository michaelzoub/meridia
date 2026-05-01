"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code2,
  Link2,
  Minus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDraft, publishArticle } from "@/app/dashboard/writing/actions";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "");
}

async function copyRichText(html: string) {
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([stripHtml(html)], { type: "text/plain" }),
    }),
  ]);
}

interface ArticleEditorProps {
  initialId?: string;
  initialTitle?: string;
  initialSubtitle?: string;
  initialContent?: string;
  initialSlug?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function ArticleEditor({
  initialId,
  initialTitle = "",
  initialSubtitle = "",
  initialContent = "",
  initialSlug = "",
}: ArticleEditorProps) {
  const router = useRouter();

  const [articleId, setArticleId] = useState<string | undefined>(initialId);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [slug, setSlug] = useState(initialSlug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialSlug);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPublishing, setIsPublishing] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [copiedFor, setCopiedFor] = useState<"substack" | "x" | null>(null);

  const contentRef = useRef(initialContent);
  const isDirty = useRef(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      contentRef.current = html;
      isDirty.current = true;
    },
  });

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const doSave = useCallback(
    async (opts: { publish?: boolean } = {}) => {
      const currentContent = contentRef.current;
      if (!opts.publish && !isDirty.current) return;

      setSaveStatus("saving");
      try {
        if (opts.publish) {
          setIsPublishing(true);
          const result = await publishArticle({
            id: articleId,
            title,
            subtitle,
            content: currentContent,
            slug,
          });
          if (result.redirectTo) {
            router.push(result.redirectTo);
            return;
          }
        } else {
          const id = await saveDraft({
            id: articleId,
            title,
            subtitle,
            content: currentContent,
            slug,
          });
          if (id && !articleId) {
            setArticleId(id);
            window.history.replaceState({}, "", `/dashboard/writing/${id}`);
          }
          isDirty.current = false;
          setSaveStatus("saved");
          if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
          savedTimeoutRef.current = setTimeout(
            () => setSaveStatus("idle"),
            2500
          );
        }
      } catch {
        setSaveStatus("error");
        setIsPublishing(false);
      }
    },
    [articleId, title, subtitle, slug, router]
  );

  // Auto-save every 30s if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty.current) {
        doSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [doSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  const addLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <nav className="flex items-center gap-4">
          <a
            href="/dashboard/writing"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← All articles
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
              saveStatus === "saving" && "text-zinc-400",
              saveStatus === "saved" && "text-cyan-700",
              saveStatus === "error" && "text-red-500",
              saveStatus === "idle" && "invisible"
            )}
          >
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </span>

          <div className="h-4 w-px bg-zinc-200" />

          <button
            onClick={async () => {
              await copyRichText(contentRef.current);
              setCopiedFor("substack");
              setTimeout(() => setCopiedFor(null), 2000);
            }}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-900"
            title="Copy for Substack"
          >
            {copiedFor === "substack" ? "Copied ✓" : "Substack"}
          </button>
          <button
            onClick={async () => {
              await copyRichText(contentRef.current);
              setCopiedFor("x");
              setTimeout(() => setCopiedFor(null), 2000);
            }}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-900"
            title="Copy for X Articles"
          >
            {copiedFor === "x" ? "Copied ✓" : "X Article"}
          </button>

          <div className="h-4 w-px bg-zinc-200" />

          <button
            onClick={() => doSave()}
            disabled={saveStatus === "saving"}
            className="border border-zinc-300 px-4 py-1.5 font-sans text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-40"
          >
            Save draft
          </button>
          <button
            onClick={() => doSave({ publish: true })}
            disabled={isPublishing || saveStatus === "saving"}
            className="border border-zinc-900 bg-zinc-900 px-4 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        {/* Title */}
        <input
          type="text"
          placeholder="Article title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            isDirty.current = true;
          }}
          className="mb-3 w-full border-none bg-transparent font-sans text-3xl font-semibold text-zinc-900 outline-none placeholder:text-zinc-300 md:text-4xl"
        />

        {/* Subtitle */}
        <input
          type="text"
          placeholder="Subtitle (optional)"
          value={subtitle}
          onChange={(e) => {
            setSubtitle(e.target.value);
            isDirty.current = true;
          }}
          className="mb-6 w-full border-none bg-transparent font-sans text-lg text-zinc-600 outline-none placeholder:text-zinc-300"
        />

        {/* Slug */}
        <div className="mb-8 flex items-center gap-2 border-b border-zinc-200 pb-6">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
            Slug
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugManuallyEdited(true);
              isDirty.current = true;
            }}
            className="min-w-0 flex-1 border-none bg-transparent font-mono text-xs text-zinc-600 outline-none placeholder:text-zinc-300"
            placeholder="article-slug"
          />
        </div>

        {/* Toolbar */}
        {editor && (
          <div className="mb-4 flex flex-wrap items-center gap-0.5 border border-zinc-200 p-1">
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={15} />
            </ToolbarButton>

            <div className="mx-1 h-4 w-px bg-zinc-200" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough size={15} />
            </ToolbarButton>

            <div className="mx-1 h-4 w-px bg-zinc-200" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Blockquote"
            >
              <Quote size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet list"
            >
              <List size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Ordered list"
            >
              <ListOrdered size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive("codeBlock")}
              title="Code block"
            >
              <Code2 size={15} />
            </ToolbarButton>

            <div className="mx-1 h-4 w-px bg-zinc-200" />

            <ToolbarButton
              onClick={() => {
                if (editor.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setShowLinkInput((v) => !v);
                }
              }}
              active={editor.isActive("link")}
              title="Link"
            >
              <Link2 size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setHorizontalRule().run()
              }
              active={false}
              title="Horizontal rule"
            >
              <Minus size={15} />
            </ToolbarButton>
          </div>
        )}

        {/* Link input */}
        {showLinkInput && (
          <div className="mb-4 flex items-center gap-2 border border-zinc-200 p-2">
            <input
              autoFocus
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addLink();
                if (e.key === "Escape") setShowLinkInput(false);
              }}
              className="flex-1 bg-transparent font-mono text-xs text-zinc-700 outline-none placeholder:text-zinc-400"
            />
            <button
              onClick={addLink}
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-700 hover:text-cyan-900"
            >
              Apply
            </button>
          </div>
        )}

        {/* Editor body */}
        <EditorContent
          editor={editor}
          className="prose prose-zinc max-w-none min-h-[400px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-zinc-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center transition-colors",
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      )}
    >
      {children}
    </button>
  );
}
