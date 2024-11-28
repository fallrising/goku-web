import { useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { type Bookmark } from '../types/bookmark';
import { formatDate } from '../lib/utils';
import { BookmarkMenu } from './BookmarkMenu';
import { BookmarkEditor } from './BookmarkEditor';
import { useClickOutside } from '../hooks/useClickOutside';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={bookmark.favicon}
              alt=""
              className="w-6 h-6 rounded"
            />
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{bookmark.title}</h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-blue-600 line-clamp-1"
              >
                {bookmark.url}
              </a>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <BookmarkMenu
              bookmarkId={bookmark.id}
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onEdit={() => setIsEditing(true)}
            />
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{bookmark.description}</p>

        {bookmark.notes && (
          <div 
            className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4"
            dangerouslySetInnerHTML={{ __html: bookmark.notes }}
          />
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {bookmark.tags.map((tag) => (
              <span
                key={tag.id}
                className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${tag.color}-100 text-${tag.color}-600`}
              >
                {tag.name}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(bookmark.createdAt)}
          </div>
        </div>
      </div>

      {isEditing && (
        <BookmarkEditor
          bookmark={bookmark}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}