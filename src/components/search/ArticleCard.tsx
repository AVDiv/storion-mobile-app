import React from "react";
import NewsCard from "../NewsCard";
import "./SearchCards.css";

interface ArticleGroup {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  articleCount: number;
  topics: Array<{ name: string; score: number }>;
  relevanceScore: number;
}

interface ArticleCardProps {
  article: ArticleGroup;
  onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHrs < 24) {
        return `${diffHrs}h ago`;
      } else {
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays}d ago`;
      }
    } catch (e) {
      return "Recent";
    }
  };

  // Generate a placeholder image based on text
  const getPlaceholderImage = (text: string): string => {
    return `https://source.unsplash.com/random/1000x600?${text.replace(
      /\s+/g,
      ","
    )}`;
  };

  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/article/${article.id}`;
    }
  };

  return (
    <NewsCard
      key={article.id}
      title={article.title}
      source={article.topics?.[0]?.name || "News Source"}
      date={formatDate(article.updatedAt)}
      excerpt={article.summary}
      imageUrl={getPlaceholderImage(article.title)}
      onClick={handleClick}
    />
  );
};

export default ArticleCard;
