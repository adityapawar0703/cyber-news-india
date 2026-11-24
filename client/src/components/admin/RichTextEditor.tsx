import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExt from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Maximize2,
  Pilcrow,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from 'lucide-react';
import { api } from '../../lib/api';

const lowlight = createLowlight(common);

const AlignedImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-align': {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => ({
          'data-align': attributes['data-align'] || 'center',
        }),
      },
    };
  },
});

const CODE_LANGUAGES = [
  { label: 'Plain / Auto', value: '' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Rust', value: 'rust' },
  { label: 'C / C++', value: 'c' },
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'SQL', value: 'sql' },
  { label: 'HTML / XML', value: 'xml' },
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      AlignedImage.configure({
        HTMLAttributes: {
          class: 'editorial-inline-image',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder:
          'Write your cybersecurity report here… Use headings, code blocks, quotes, and inline images.',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'article-prose focus:outline-none',
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              setUploadingImg(true);
              setUploadError(null);
              api
                .uploadImage(file)
                .then((uploaded) => {
                  editorRef.current
                    ?.chain()
                    .focus()
                    .setImage({ src: uploaded.url, alt: 'Pasted image' })
                    .run();
                })
                .catch((err) => {
                  setUploadError(
                    err instanceof Error ? err.message : 'Pasted image upload failed'
                  );
                })
                .finally(() => setUploadingImg(false));
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          setUploadingImg(true);
          setUploadError(null);
          api
            .uploadImage(file)
            .then((uploaded) => {
              editorRef.current
                ?.chain()
                .focus()
                .setImage({ src: uploaded.url, alt: file.name.replace(/\.[^.]+$/, '') })
                .run();
            })
            .catch((err) => {
              setUploadError(
                err instanceof Error ? err.message : 'Dropped image upload failed'
              );
            })
            .finally(() => setUploadingImg(false));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Sync external initial content loads (e.g. Edit existing article)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  if (!editor) return null;

  const isImageActive = editor.isActive('image');
  const isCodeBlockActive = editor.isActive('codeBlock');
  const currentCodeLang = editor.getAttributes('codeBlock').language || '';
  const currentImageAlign = editor.getAttributes('image')['data-align'] || 'center';

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    setUploadError(null);
    try {
      const uploaded = await api.uploadImage(file);
      editor
        .chain()
        .focus()
        .setImage({ src: uploaded.url, alt: file.name.replace(/\.[^.]+$/, '') })
        .run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyImageAlign = (align: 'left' | 'center' | 'right' | 'full') => {
    editor.chain().focus().updateAttributes('image', { 'data-align': align }).run();
  };

  const openLinkPrompt = () => {
    const prev = editor.getAttributes('link').href || 'https://';
    setLinkUrl(prev);
    setLinkInputOpen(true);
  };

  const applyLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = linkUrl.trim();
    if (!cleaned || cleaned === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = /^https?:\/\/|^mailto:|^\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkInputOpen(false);
  };

  const ToolBtn = ({
    active = false,
    disabled = false,
    onClick,
    title,
    children,
  }: {
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
        active
          ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
          : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0B101B]">
      {/* Formatting Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-slate-800/90 bg-[#0F1625] px-3 py-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-800">
          <ToolBtn
            title="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" />
          </ToolBtn>
        </div>

        {/* Headings & Paragraph */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-800">
          <ToolBtn
            title="Paragraph"
            active={editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <Pilcrow className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Heading 1"
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Heading 3"
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </ToolBtn>
        </div>

        {/* Inline Marks */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-800">
          <ToolBtn
            title="Bold"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Italic"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Underline"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Inline Code"
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </ToolBtn>
        </div>

        {/* Lists, Quote, Code Block */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-800">
          <ToolBtn
            title="Bullet List"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Numbered List"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Blockquote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            title="Syntax-Highlighted Code Block"
            active={isCodeBlockActive}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 className="h-4 w-4" />
          </ToolBtn>
        </div>

        {/* Links & Inline Image Upload */}
        <div className="flex items-center gap-0.5 px-1.5">
          <ToolBtn
            title="Insert / Edit Hyperlink"
            active={editor.isActive('link')}
            onClick={openLinkPrompt}
          >
            <Link2 className="h-4 w-4" />
          </ToolBtn>
          {editor.isActive('link') && (
            <ToolBtn
              title="Remove Link"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Unlink className="h-4 w-4" />
            </ToolBtn>
          )}
          <ToolBtn
            title="Upload & Insert Image"
            disabled={uploadingImg}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingImg ? (
              <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </ToolBtn>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        {/* Contextual Code Language Selector */}
        {isCodeBlockActive && (
          <div className="ml-auto flex items-center gap-1.5 pl-2">
            <span className="font-mono text-[10px] uppercase text-slate-500">Lang:</span>
            <select
              aria-label="Code block language"
              value={currentCodeLang}
              onChange={(e) =>
                editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()
              }
              className="rounded-md border border-slate-700 bg-[#0A0F1A] px-2 py-1 font-mono text-[11px] text-sky-300 focus:outline-none"
            >
              {CODE_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Contextual Image Alignment Controls */}
        {isImageActive && (
          <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-sky-500/30 bg-sky-500/5 px-1.5 py-0.5">
            <span className="px-1 font-mono text-[10px] uppercase text-sky-400">Img Align:</span>
            <ToolBtn
              title="Align Image Left"
              active={currentImageAlign === 'left'}
              onClick={() => applyImageAlign('left')}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn
              title="Align Image Center"
              active={currentImageAlign === 'center'}
              onClick={() => applyImageAlign('center')}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn
              title="Align Image Right"
              active={currentImageAlign === 'right'}
              onClick={() => applyImageAlign('right')}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn
              title="Full Width Image"
              active={currentImageAlign === 'full'}
              onClick={() => applyImageAlign('full')}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </ToolBtn>
          </div>
        )}
      </div>

      {/* Inline Link Bar */}
      {linkInputOpen && (
        <form
          onSubmit={applyLink}
          className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-[#0D1422] px-4 py-2.5"
        >
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://nvd.nist.gov/vuln/detail/..."
            autoFocus
            className="flex-1 min-w-[200px] rounded-lg border border-slate-700 bg-[#070B12] px-3 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400"
          >
            Apply Link
          </button>
          <button
            type="button"
            onClick={() => setLinkInputOpen(false)}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}

      {uploadError && (
        <div className="border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
          {uploadError}
        </div>
      )}

      {/* TipTap Editable Canvas */}
      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
