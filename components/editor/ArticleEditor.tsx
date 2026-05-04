"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import "katex/dist/katex.min.css";
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
  ImageIcon,
  Sigma,
  Superscript,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDraft, publishArticle } from "@/app/dashboard/writing/actions";
import { cn } from "@/lib/utils";
import { LatexBlock, LatexInline } from "@/components/editor/extensions/latexNodes";

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

function countWordsFromPlainText(text: string): number {
  const t = text.replace(/\u00a0/g, " ").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

interface ArticleEditorProps {
  initialId?: string;
  initialTitle?: string;
  initialSubtitle?: string;
  initialContent?: string;
  initialSlug?: string;
  initialWrittenBy?: string;
  initialCoverImageUrl?: string;
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
  initialWrittenBy = "",
  initialCoverImageUrl = "",
}: ArticleEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [articleId, setArticleId] = useState<string | undefined>(initialId);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [writtenBy, setWrittenBy] = useState(initialWrittenBy);
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl);
  const [slug, setSlug] = useState(initialSlug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialSlug);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPublishing, setIsPublishing] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [copiedFor, setCopiedFor] = useState<"substack" | "x" | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [coverUploading, setCoverUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const contentRef = useRef(initialContent);
  const isDirty = useRef(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable ref so editorProps callbacks never go stale
  const insertImageRef = useRef<(file: File) => Promise<void>>(async () => {});

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      Image.configure({ inline: false, allowBase64: false }),
      LatexBlock,
      LatexInline,
    ],
    content: initialContent,
    immediatelyRender: false,
    onCreate({ editor }) {
      contentRef.current = editor.getHTML();
      setWordCount(
        countWordsFromPlainText(editor.getText({ blockSeparator: "\n" }))
      );
    },
    onUpdate({ editor }) {
      contentRef.current = editor.getHTML();
      isDirty.current = true;
      setWordCount(
        countWordsFromPlainText(editor.getText({ blockSeparator: "\n" }))
      );
    },
    editorProps: {
      // Drag-and-drop images onto the editor canvas
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (!files.length) return false;
        event.preventDefault();
        files.forEach((f) => insertImageRef.current(f));
        return true;
      },
      // Paste images from clipboard
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter(
          (f) => f.type.startsWith("image/")
        );
        if (!files.length) return false;
        event.preventDefault();
        files.forEach((f) => insertImageRef.current(f));
        return true;
      },
    },
  });

  // Keep insertImageRef up-to-date whenever editor changes
  useEffect(() => {
    insertImageRef.current = async (file: File) => {
      if (!editor) return;
      setUploadCount((n) => n + 1);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/dashboard/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: res.statusText }));
          alert(`Upload failed: ${error}`);
          return;
        }
        const { url } = await res.json();
        // After inserting the image (a leaf node), create a paragraph so
        // the cursor has somewhere to go and the user can keep typing.
        editor
          .chain()
          .focus()
          .setImage({ src: url })
          .createParagraphNear()
          .focus()
          .run();
      } finally {
        setUploadCount((n) => n - 1);
      }
    };
  }, [editor]);

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
            writtenBy,
            coverImageUrl,
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
            writtenBy,
            coverImageUrl,
          });
          if (id && !articleId) {
            setArticleId(id);
            window.history.replaceState({}, "", `/dashboard/writing/${id}`);
          }
          isDirty.current = false;
          setSaveStatus("saved");
          if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
          savedTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
        }
      } catch {
        setSaveStatus("error");
        setIsPublishing(false);
      }
    },
    [articleId, title, subtitle, slug, writtenBy, coverImageUrl, router]
  );

  // Auto-save every 30s if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty.current) doSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [doSave]);

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

  const handleImageFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      files.forEach((f) => insertImageRef.current(f));
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    []
  );

  const isUploading = uploadCount > 0;

  const uploadCoverFile = useCallback(async (file: File) => {
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/dashboard/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: res.statusText }));
        alert(`Upload failed: ${error}`);
        return;
      }
      const { url } = await res.json();
      setCoverImageUrl(url);
      isDirty.current = true;
    } finally {
      setCoverUploading(false);
    }
  }, []);

  const handleCoverFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void uploadCoverFile(file);
      e.target.value = "";
    },
    [uploadCoverFile]
  );

  const insertLatexBlock = useCallback(() => {
    if (!editor) return;
    const latex = window.prompt("LaTeX (display math)", "E = mc^2");
    if (latex === null) return;
    editor
      .chain()
      .focus()
      .insertContent({ type: "latexBlock", attrs: { latex } })
      .run();
  }, [editor]);

  const insertLatexInline = useCallback(() => {
    if (!editor) return;
    const latex = window.prompt("LaTeX (inline math)", "x^2");
    if (latex === null) return;
    editor
      .chain()
      .focus()
      .insertContent({ type: "latexInline", attrs: { latex } })
      .run();
  }, [editor]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hidden file input for toolbar image button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageFileInput}
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverFileInput}
      />

      {/* Top bar — toolbar uses top-14 to clear this row (~56px) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
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
              (isUploading || coverUploading) && "text-zinc-400",
              !isUploading &&
                !coverUploading &&
                saveStatus === "saving" &&
                "text-zinc-400",
              !isUploading &&
                !coverUploading &&
                saveStatus === "saved" &&
                "text-cyan-700",
              !isUploading &&
                !coverUploading &&
                saveStatus === "error" &&
                "text-red-500",
              !isUploading && !coverUploading && saveStatus === "idle" && "invisible"
            )}
          >
            {coverUploading
              ? "Uploading cover…"
              : isUploading
              ? `Uploading image${uploadCount > 1 ? "s" : ""}…`
              : saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
              ? "Saved"
              : saveStatus === "error"
              ? "Save failed"
              : ""}
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
            disabled={saveStatus === "saving" || isUploading || coverUploading}
            className="border border-zinc-300 px-4 py-1.5 font-sans text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-40"
          >
            Save draft
          </button>
          <button
            onClick={() => doSave({ publish: true })}
            disabled={
              isPublishing || saveStatus === "saving" || isUploading || coverUploading
            }
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

        <div className="mb-8 space-y-6 border-b border-zinc-200 pb-8">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
              Written by
            </label>
            <input
              type="text"
              value={writtenBy}
              onChange={(e) => {
                setWrittenBy(e.target.value);
                isDirty.current = true;
              }}
              placeholder="Name shown at the end of the article (optional)"
              className="mt-2 w-full border border-zinc-200 bg-white px-3 py-2 font-sans text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
              Cover image
            </p>
            <div className="mt-2 flex flex-wrap items-start gap-4">
              {coverImageUrl ? (
                <div className="relative border border-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL */}
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="max-h-40 w-auto max-w-full object-contain"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  disabled={coverUploading}
                  className="w-fit border border-zinc-300 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-40"
                >
                  {coverImageUrl ? "Replace cover" : "Upload cover"}
                </button>
                {coverImageUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageUrl("");
                      isDirty.current = true;
                    }}
                    className="w-fit font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 underline-offset-4 hover:text-zinc-900"
                  >
                    Remove cover
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar — sticky under dashboard header while scrolling */}
        {editor && (
          <div
            className={cn(
              "sticky top-14 z-10 -mx-6 mb-4 border-b border-zinc-200 bg-white px-6 py-2",
              showLinkInput && "pb-3"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border border-zinc-200 p-1">
            <div className="flex flex-wrap items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              active={false}
              title="Horizontal rule"
            >
              <Minus size={15} />
            </ToolbarButton>

            <div className="mx-1 h-4 w-px bg-zinc-200" />

            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              active={false}
              title="Insert image"
              disabled={isUploading}
            >
              <ImageIcon size={15} />
            </ToolbarButton>

            <div className="mx-1 h-4 w-px bg-zinc-200" />

            <ToolbarButton
              onClick={insertLatexBlock}
              active={editor.isActive("latexBlock")}
              title="Insert display math (LaTeX). Double-click to edit."
            >
              <Sigma size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={insertLatexInline}
              active={editor.isActive("latexInline")}
              title="Insert inline math (LaTeX). Double-click to edit."
            >
              <Superscript size={15} />
            </ToolbarButton>
            </div>

            <span
              className="shrink-0 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500"
              title="Word count (body text; math nodes are not counted)"
            >
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            </div>

            {showLinkInput ? (
              <div className="mt-3 flex items-center gap-2 border border-zinc-200 p-2">
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
            ) : null}
          </div>
        )}

        {/* Editor body */}
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-zinc max-w-none min-h-[400px]",
            "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]",
            // Placeholder
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-zinc-400",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
            // Images
            "[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto",
            "[&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:block",
            "[&_.ProseMirror_img.ProseMirror-selectednode]:outline",
            "[&_.ProseMirror_img.ProseMirror-selectednode]:outline-2",
            "[&_.ProseMirror_img.ProseMirror-selectednode]:outline-cyan-600",
            // KaTeX in editor
            "[&_.ProseMirror_.katex-display]:my-2",
            "[&_.ProseMirror_.katex]:text-inherit",
            // Drop zone highlight while dragging
            isUploading && "[&_.ProseMirror]:opacity-60"
          )}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center transition-colors disabled:opacity-40",
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      )}
    >
      {children}
    </button>
  );
}
