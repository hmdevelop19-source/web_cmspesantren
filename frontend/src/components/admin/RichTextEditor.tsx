import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import ResizableImage from './extensions/ResizableImage';
import { useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Link as LinkIcon, Undo, Redo,
  Heading1, Heading2, Strikethrough,
  ImagePlus, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import TextAlign from '@tiptap/extension-text-align';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onOpenMediaLibrary?: () => void;
}

const RichTextEditor = forwardRef((props: RichTextEditorProps, ref) => {
  const { content, onChange, onOpenMediaLibrary } = props;
  const extensions = useMemo(() => [
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    /* 
    TiptapLink.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline decoration-secondary cursor-pointer',
      },
    }),
    */
    ResizableImage.configure({
      allowBase64: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph', 'image'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[400px] max-w-none text-gray-800 leading-relaxed font-medium',
      },
    },
  });

  useImperativeHandle(ref, () => ({
    insertImage: (url: string) => {
      console.log('RichTextEditor: Memasukkan gambar...', url);
      if (editor) {
        editor.commands.focus();
        editor.commands.setImage({ src: url });
        console.log('RichTextEditor: Perintah setImage telah dikirim.');
      } else {
        console.error('RichTextEditor: Editor instance tidak ditemukan!');
      }
    }
  }), [editor]);

  // Handle External Image Insertion
  useEffect(() => {
    // We will handle this via a command from the parent or exposure of the editor instance
  }, [editor]);

  // Sinkronisasi konten dari luar (misal: saat data dari API tiba).
  // Hanya jalankan jika editor kosong agar tidak menimpa ketikan pengguna.
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      const timer = setTimeout(() => {
        editor.commands.setContent(content);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive ? 'bg-primary text-secondary' : 'text-gray-600 hover:bg-gray-200 hover:text-black'
      }`}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-gray-200 px-2 py-2 flex flex-wrap items-center gap-1 bg-gray-50 sticky top-0 z-20">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        <MenuButton 
          onClick={() => (editor.commands as any).setTextAlign('left')} 
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => (editor.commands as any).setTextAlign('center')} 
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => (editor.commands as any).setTextAlign('right')} 
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => (editor.commands as any).setTextAlign('justify')} 
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Align Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive('bulletList')}
          title="Bulleted List"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        
        <MenuButton 
          onClick={() => onOpenMediaLibrary?.()} 
          isActive={false} 
          title="Pilih dari Pustaka Media"
        >
          <ImagePlus className="w-4 h-4" />
        </MenuButton>
        
        <MenuButton onClick={addLink} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        
        <div className="flex-grow"></div>
        
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor Content Area */}
      <div className="flex-grow bg-white overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      
      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 text-[10px] font-black text-gray-400 flex justify-between uppercase tracking-widest">
         <span>Editor Visual Aktif</span>
         <span>Tiptap Engine v2</span>
      </div>
    </div>
  );
});

export default RichTextEditor;
