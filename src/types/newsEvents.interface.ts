export interface Topic {
  name: string;
  score: number;
}

export interface NewsEvent {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  articleCount: number;
  imageUrl?: string;
  topics: Topic[];
}

export interface NewsEventArticle {
  id: string;
  title: string;
  url: string | null;
  publicationDate: string;
  updatedAt: string | null;
  sourceId: string | null;
  sourceName: string | null;
  imageUrl?: string;
}

export interface NewsEventArticlesResponse {
  articles: NewsEventArticle[];
  totalCount: number;
}
