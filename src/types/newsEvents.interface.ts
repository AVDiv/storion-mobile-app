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
  // Language bias properties
  overallLanguageBias?: number;
  unbiasedArticlesCount?: number;
  biasedArticlesCount?: number;
  // Political bias properties
  overallPoliticalBiasScore?: number;
  overallPoliticalBiasConfidence?: number;
  leftLeaningArticlesCount?: number;
  rightLeaningArticlesCount?: number;
  centerArticlesCount?: number;
  politicalBiasDistribution?: {
    left: number;
    right: number;
    center: number;
  };
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
  // Language bias property
  languageBias?: number;
  // Political bias properties
  politicalBiasConfidence?: number;
  politicalBiasOrientation?: "left" | "right" | "center";
}

export interface NewsEventArticlesResponse {
  articles: NewsEventArticle[];
  totalCount: number;
}
