import { create } from 'zustand';
import { type Bookmark, type Category, type Tag, type PaginationState } from '../types/bookmark';

interface BookmarkStore {
  bookmarks: Bookmark[];
  categories: Category[];
  tags: Tag[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedTags: string[];
  pagination: PaginationState;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  toggleTag: (tagId: string) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, bookmark: Partial<Bookmark>) => void;
  setPagination: (pagination: PaginationState) => void;
  fetchBookmarks: (page: number) => Promise<void>;
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
}

// Simulated API call
const fetchBookmarksFromAPI = async (
  page: number,
  limit: number,
  filters: { search?: string; category?: string; tags: string[] }
): Promise<{ bookmarks: Bookmark[]; hasMore: boolean }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate paginated data
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Generate mock data
  const mockBookmarks: Bookmark[] = Array.from({ length: 50 }, (_, i) => ({
    id: `bookmark-${startIndex + i}`,
    title: `Bookmark ${startIndex + i + 1}`,
    url: `https://example.com/bookmark-${startIndex + i + 1}`,
    description: `Description for bookmark ${startIndex + i + 1}`,
    favicon: `https://www.google.com/favicon.ico`,
    category: { id: '1', name: 'Work', icon: 'briefcase' },
    tags: [{ id: '1', name: 'Important', color: 'red' }],
    createdAt: new Date(Date.now() - i * 86400000),
  }));

  const filteredBookmarks = mockBookmarks
    .filter((bookmark) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!bookmark.title.toLowerCase().includes(searchLower) &&
            !bookmark.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      if (filters.category && bookmark.category.id !== filters.category) {
        return false;
      }
      if (filters.tags.length > 0) {
        return filters.tags.every((tagId) =>
          bookmark.tags.some((tag) => tag.id === tagId)
        );
      }
      return true;
    });

  const paginatedBookmarks = filteredBookmarks.slice(startIndex, endIndex);
  const hasMore = endIndex < filteredBookmarks.length;

  return { bookmarks: paginatedBookmarks, hasMore };
};

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  categories: [
    { id: '1', name: 'Work', icon: 'briefcase' },
    { id: '2', name: 'Personal', icon: 'user' },
    { id: '3', name: 'Learning', icon: 'book-open' },
    { id: '4', name: 'Entertainment', icon: 'tv' },
  ],
  tags: [
    { id: '1', name: 'Important', color: 'red' },
    { id: '2', name: 'Reference', color: 'blue' },
    { id: '3', name: 'Tutorial', color: 'green' },
    { id: '4', name: 'Read Later', color: 'purple' },
  ],
  searchQuery: '',
  selectedCategory: null,
  selectedTags: [],
  pagination: {
    page: 1,
    limit: 12,
    hasMore: true,
    isLoading: false,
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  toggleTag: (tagId) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tagId)
        ? state.selectedTags.filter((id) => id !== tagId)
        : [...state.selectedTags, tagId],
    })),

  setPagination: (pagination) => set({ pagination }),

  fetchBookmarks: async (page: number) => {
    const state = get();
    const { bookmarks: newBookmarks, hasMore } = await fetchBookmarksFromAPI(
      page,
      state.pagination.limit,
      {
        search: state.searchQuery,
        category: state.selectedCategory || undefined,
        tags: state.selectedTags,
      }
    );

    set((state) => ({
      bookmarks: page === 1 ? newBookmarks : [...state.bookmarks, ...newBookmarks],
      pagination: {
        ...state.pagination,
        page,
        hasMore,
        isLoading: false,
      },
    }));
  },

  addBookmark: (bookmark) =>
    set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
  removeBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
    })),
  updateBookmark: (id, updatedBookmark) =>
    set((state) => ({
      bookmarks: state.bookmarks.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, ...updatedBookmark } : bookmark
      ),
    })),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
      // Reset selected category if it's being removed
      selectedCategory: state.selectedCategory === id ? null : state.selectedCategory,
      // Update bookmarks to move them to uncategorized
      bookmarks: state.bookmarks.map((bookmark) =>
        bookmark.category.id === id
          ? { ...bookmark, category: { id: 'uncategorized', name: 'Uncategorized', icon: 'folder' } }
          : bookmark
      ),
    })),
  updateCategory: (id, updatedCategory) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? { ...category, ...updatedCategory } : category
      ),
      // Update bookmarks with the new category data
      bookmarks: state.bookmarks.map((bookmark) =>
        bookmark.category.id === id
          ? { ...bookmark, category: { ...bookmark.category, ...updatedCategory } }
          : bookmark
      ),
    })),
}));