export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  imageUrl: string;
}

export interface Guide {
  id: string;
  categoryId: string;
  title: string;
  excerpt: string;
  content: string;
  order?: number;
}

export interface SearchResult extends Guide {
  categoryName: string;
}

export interface CategoryWithGuides extends Category {
  guides: Guide[];
}
