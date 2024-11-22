import { IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import React from "react";
import "./FeedCard.css";
import Tag from "../utils/Tag";

interface FeedCardProps {
  title: string;
  publishedAt?: string;
  noOfSources?: number;
  topic?: string;
  region?: string;
  content?: string;
  imageUrl: string;
}

const FeedCard: React.FC<FeedCardProps> = ({
  imageUrl,
  title,
  publishedAt,
  noOfSources,
  content,
  topic,
  region,
}) => {
  return (
    <IonCard className="feed-card">
      <IonCardHeader>
        <div className="card-image">
          <div className="feed-card-header-details">
            {topic && <Tag isNew content={topic} />}
            {region && <Tag content={region} />}
          </div>
          <img src={imageUrl} alt={title} />
        </div>
        <h2>{title}</h2>
        <p>
          {publishedAt && publishedAt}
          &nbsp;●&nbsp;
          {noOfSources && `${noOfSources} sources`}
        </p>
      </IonCardHeader>

      <IonCardContent>
        <p>{content && content}</p>
      </IonCardContent>
    </IonCard>
  );
};

export default FeedCard;
