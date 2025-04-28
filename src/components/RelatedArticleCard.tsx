import React from "react";
import { IonCard, IonCardContent, IonLabel, IonIcon } from "@ionic/react";
import { timeOutline } from "ionicons/icons";
import "./RelatedArticleCard.css";

interface RelatedArticleCardProps {
  id: string;
  title: string;
  sourceName: string | null;
  publicationDate: string;
  imageUrl?: string;
  onClick: (id: string) => void;
}

const RelatedArticleCard: React.FC<RelatedArticleCardProps> = ({
  id,
  title,
  sourceName,
  publicationDate,
  imageUrl,
  onClick,
}) => {
  const placeholderImage = "/image-placeholder.webp"; // Use the placeholder from public folder

  return (
    <IonCard
      className="related-article-card"
      onClick={() => onClick(id)}
      button
    >
      <img
        src={imageUrl || placeholderImage}
        alt={title}
        className="related-article-image"
        onError={(e) => (e.currentTarget.src = placeholderImage)} // Fallback image
      />
      <IonCardContent className="related-article-content">
        <IonLabel className="related-article-title">
          <h3>{title}</h3>
        </IonLabel>
        <div className="related-article-meta">
          <span className="related-article-source">
            {sourceName || "Unknown Source"}
          </span>
          <span className="related-article-date">
            <IonIcon icon={timeOutline} size="small" />
            {publicationDate}
          </span>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default RelatedArticleCard;
