export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description: string;
  notes?: string;
  favicon: string;
  category: Category;
  tags: Tag[];
  createdAt: Date;
  lastVisited?: Date;
};

export type PaginationState = {
  page: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
};