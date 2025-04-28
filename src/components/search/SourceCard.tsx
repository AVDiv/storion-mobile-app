import React from "react";
import { IonItem, IonLabel } from "@ionic/react";
import "./SearchCards.css";

interface Source {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  articleCount: number;
  relevanceScore: number;
}

interface SourceCardProps {
  source: Source;
  onClick?: () => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/source/${source.id}`;
    }
  };

  return (
    <IonItem
      key={source.id}
      detail={true}
      button
      onClick={handleClick}
      lines="none"
      className="source-card-item"
    >
      <IonLabel>
        <h2>{source.name}</h2>
        <p>{source.domain}</p>
      </IonLabel>
      <div slot="end" className="source-stats">
        {source.articleCount} articles
      </div>
    </IonItem>
  );
};

export default SourceCard;
