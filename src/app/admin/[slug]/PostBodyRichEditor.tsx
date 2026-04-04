"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

import { bodyToEditorHtml } from "@/lib/post-body-html";

type PostBodyRichEditorProps = {
  initialBody: string;
  onHtmlChange: (html: string) => void;
};

export function PostBodyRichEditor({
  initialBody,
  onHtmlChange,
}: PostBodyRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Текст поста…",
      }),
    ],
    content: bodyToEditorHtml(initialBody),
    immediatelyRender: false,
    onCreate: ({ editor: ed }) => {
      onHtmlChange(ed.getHTML());
    },
    onUpdate: ({ editor: ed }) => {
      onHtmlChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "post-body-editor__prose",
      },
    },
  });

  const syncedInitialRef = useRef(initialBody);
  useEffect(() => {
    if (!editor) {
      return;
    }
    if (syncedInitialRef.current === initialBody) {
      return;
    }
    syncedInitialRef.current = initialBody;
    editor.commands.setContent(bodyToEditorHtml(initialBody));
  }, [editor, initialBody]);

  if (!editor) {
    return (
      <div className="post-body-editor post-body-editor--loading" aria-busy="true">
        <div className="post-body-editor__shell" />
      </div>
    );
  }

  return (
    <div className="post-body-editor">
      <div
        className="post-body-editor__toolbar"
        role="toolbar"
        aria-label="Форматирование текста поста"
      >
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("bold") ? " post-body-editor__tool--active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          aria-label="Жирный"
          aria-pressed={editor.isActive("bold")}
        >
          B
        </button>
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("italic") ? " post-body-editor__tool--active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          aria-label="Курсив"
          aria-pressed={editor.isActive("italic")}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("code") ? " post-body-editor__tool--active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          aria-label="Код"
          aria-pressed={editor.isActive("code")}
        >
          {"</>"}
        </button>
        <span className="post-body-editor__toolbar-sep" aria-hidden />
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("heading", { level: 2 })
              ? " post-body-editor__tool--active"
              : ""
          }`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Заголовок 2 уровня"
          aria-pressed={editor.isActive("heading", { level: 2 })}
        >
          H2
        </button>
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("heading", { level: 3 })
              ? " post-body-editor__tool--active"
              : ""
          }`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          aria-label="Заголовок 3 уровня"
          aria-pressed={editor.isActive("heading", { level: 3 })}
        >
          H3
        </button>
        <span className="post-body-editor__toolbar-sep" aria-hidden />
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("bulletList") ? " post-body-editor__tool--active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Маркированный список"
          aria-pressed={editor.isActive("bulletList")}
        >
          •
        </button>
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("orderedList") ? " post-body-editor__tool--active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Нумерованный список"
          aria-pressed={editor.isActive("orderedList")}
        >
          1.
        </button>
        <button
          type="button"
          className={`post-body-editor__tool${
            editor.isActive("blockquote")
              ? " post-body-editor__tool--active"
              : ""
          }`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Цитата"
          aria-pressed={editor.isActive("blockquote")}
        >
          «»
        </button>
        <span className="post-body-editor__toolbar-sep" aria-hidden />
        <button
          type="button"
          className="post-body-editor__tool"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          aria-label="Отменить"
        >
          ↶
        </button>
        <button
          type="button"
          className="post-body-editor__tool"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          aria-label="Повторить"
        >
          ↷
        </button>
      </div>
      <EditorContent editor={editor} className="post-body-editor__content" />
    </div>
  );
}
