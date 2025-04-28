import React from "react";
import { IonChip, IonLabel } from "@ionic/react";
import "./SearchCards.css";

interface Topic {
  name: string;
  description: string;
  createdAt: string;
  articleGroupCount: number;
  relevanceScore: number;
}

interface TopicCardProps {
  topic: Topic;
  onClick?: (topicName: string) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  const handleTopicClick = () => {
    if (onClick) {
      onClick(topic.name);
    }
  };

  return (
    <IonChip
      key={topic.name}
      color="secondary"
      onClick={handleTopicClick}
      className="result-topic-chip"
      outline={true}
    >
      <IonLabel>{topic.name}</IonLabel>
      <span className="article-count">{topic.articleGroupCount} articles</span>
    </IonChip>
  );
};

export default TopicCard;
