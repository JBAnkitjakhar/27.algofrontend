// src/components/admin/CourseEditor.tsx

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {TextStyle} from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';

// Import individual languages for better highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import kotlin from 'highlight.js/lib/languages/kotlin';
import swift from 'highlight.js/lib/languages/swift';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml'; // for HTML
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';

import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
  Palette,
  Terminal
} from 'lucide-react';
import { useUploadCourseImage } from '@/hooks/useCoursesManagement';
import toast from 'react-hot-toast';
import './styles/CourseEditorHighlighting.css';

// Create lowlight instance with all languages
const lowlight = createLowlight();

// Register all languages
lowlight.register('javascript', javascript);
lowlight.register('js', javascript); // alias
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript); // alias
lowlight.register('python', python);
lowlight.register('py', python); // alias
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('c++', cpp); // alias
lowlight.register('c', c);
lowlight.register('csharp', csharp);
lowlight.register('cs', csharp); // alias
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('rb', ruby); // alias
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('rs', rust); // alias
lowlight.register('kotlin', kotlin);
lowlight.register('kt', kotlin); // alias
lowlight.register('swift', swift);
lowlight.register('sql', sql);
lowlight.register('html', xml);
lowlight.register('xml', xml);
lowlight.register('css', css);
lowlight.register('json', json);
lowlight.register('bash', bash);
lowlight.register('shell', bash); // alias
lowlight.register('yaml', yaml);
lowlight.register('yml', yaml); // alias
lowlight.register('markdown', markdown);
lowlight.register('md', markdown); // alias

interface CourseEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

// Color palette for text and highlighting
const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
  '#808080', '#8B4513', '#000080', '#008000', '#FF6347'
];

const HIGHLIGHT_COLORS = [
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#4CAF50',
  '#00BCD4', '#03A9F4', '#2196F3', '#9C27B0', '#E91E63'
];

// Available programming languages for code blocks
const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
];

export default function CourseEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing your content...',
  editable = true 
}: CourseEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('#FFEB3B');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isMounted, setIsMounted] = useState(false);
  
  const uploadImageMutation = useUploadCourseImage();

  // Ensure we're on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      TextStyle,
      Color,
      Highlight.configure({ 
        multicolor: true 
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs', // Add hljs class for highlight.js styling
          spellcheck: 'false',
        },
        defaultLanguage: 'javascript',
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    immediatelyRender: false, // Required for SSR
  });

  // Update editor content when prop changes (only after mounted)
  useEffect(() => {
    if (isMounted && editor && content !== editor.getHTML()) {
      // Use a small delay to ensure editor is fully initialized
      const timer = setTimeout(() => {
        editor.commands.setContent(content || '', { emitUpdate: false });
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [content, editor, isMounted]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      setIsUploadingImage(true);
      
      try {
        const result = await uploadImageMutation.mutateAsync(file);
        
        if (result && editor) {
          // Insert image at current cursor position
          editor.chain().focus().setImage({ src: result.secure_url }).run();
          toast.success('Image inserted successfully');
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploadingImage(false);
      }
    };

    input.click();
  }, [editor, uploadImageMutation]);

  const insertCodeBlock = useCallback(() => {
    if (editor) {
      editor.chain().focus().setCodeBlock({ language: selectedLanguage }).run();
    }
  }, [editor, selectedLanguage]);

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {editable && (
        <div className="bg-gray-50 border-b border-gray-300 p-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text formatting */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('bold') ? 'bg-gray-200' : ''
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('italic') ? 'bg-gray-200' : ''
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('code') ? 'bg-gray-200' : ''
                }`}
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
                }`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
                }`}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('bulletList') ? 'bg-gray-200' : ''
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('orderedList') ? 'bg-gray-200' : ''
                }`}
                title="Ordered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive('blockquote') ? 'bg-gray-200' : ''
                }`}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            {/* Text Align */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
                }`}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
                }`}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
                }`}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1 border-r pr-2">
              {/* Text Color */}
              <div className="relative group">
                <button
                  className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
                  title="Text Color"
                >
                  <Palette className="w-4 h-4" />
                  <div 
                    className="w-4 h-1 rounded"
                    style={{ backgroundColor: selectedTextColor }}
                  />
                </button>
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg hidden group-hover:grid grid-cols-5 gap-1 z-10">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setSelectedTextColor(color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Highlight Color */}
              <div className="relative group">
                <button
                  className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
                  title="Highlight Color"
                >
                  <Highlighter className="w-4 h-4" />
                  <div 
                    className="w-4 h-1 rounded"
                    style={{ backgroundColor: selectedHighlightColor }}
                  />
                </button>
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg hidden group-hover:grid grid-cols-5 gap-1 z-10">
                  {HIGHLIGHT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                        setSelectedHighlightColor(color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Image and Code Block */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={handleImageUpload}
                disabled={isUploadingImage}
                className="p-2 rounded hover:bg-gray-200"
                title="Insert Image"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </button>
              
              {/* Code Block with language selector */}
              <div className="flex items-center gap-1">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  {CODE_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={insertCodeBlock}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('codeBlock') ? 'bg-gray-200' : ''
                  }`}
                  title="Insert Code Block"
                >
                  <Terminal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}