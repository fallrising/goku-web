import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from 'lucide-react';
import { cn } from '../lib/utils';
import { type Bookmark } from '../types/bookmark';
import { useBookmarkStore } from '../store/bookmarkStore';

interface BookmarkEditorProps {
  bookmark: Bookmark;
  onClose: () => void;
}

export function BookmarkEditor({ bookmark, onClose }: BookmarkEditorProps) {
  const { categories, tags, updateBookmark } = useBookmarkStore();
  const [formData, setFormData] = React.useState({
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    category: bookmark.category?.id ?? categories[0]?.id,
    tags: bookmark.tags?.map(t => t.id) ?? [],
    notes: bookmark.notes || ''
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
    ],
    content: formData.notes,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, notes: editor.getHTML() }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = categories.find(c => c.id === formData.category);
    const selectedTags = tags.filter(t => formData.tags.includes(t.id));
    
    updateBookmark(bookmark.id, {
      title: formData.title,
      url: formData.url,
      description: formData.description,
      category: selectedCategory!,
      tags: selectedTags,
      notes: formData.notes
    });
    
    onClose();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Edit Bookmark</h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <label
                    key={tag.id}
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                      formData.tags.includes(tag.id)
                        ? `bg-${tag.color}-100 text-${tag.color}-600`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.tags.includes(tag.id)}
                      onChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag.id)
                            ? prev.tags.filter(t => t !== tag.id)
                            : [...prev.tags, tag.id]
                        }));
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <div className="border border-gray-200 rounded-lg">
                <div className="border-b border-gray-200 p-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                      "p-1 rounded hover:bg-gray-100",
                      editor.isActive('bold') && "bg-gray-100"
                    )}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                      "p-1 rounded hover:bg-gray-100",
                      editor.isActive('italic') && "bg-gray-100"
                    )}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                      "p-1 rounded hover:bg-gray-100",
                      editor.isActive('bulletList') && "bg-gray-100"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                      "p-1 rounded hover:bg-gray-100",
                      editor.isActive('orderedList') && "bg-gray-100"
                    )}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = window.prompt('Enter URL');
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      }
                    }}
                    className={cn(
                      "p-1 rounded hover:bg-gray-100",
                      editor.isActive('link') && "bg-gray-100"
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <EditorContent 
                  editor={editor} 
                  className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}