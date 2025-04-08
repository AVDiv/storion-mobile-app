import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonSkeletonText,
  createAnimation,
} from "@ionic/react";
import {
  bookmarkOutline,
  shareOutline,
  timeOutline,
  caretForwardCircle,
} from "ionicons/icons";
import "./NewsCard.css";

interface NewsCardProps {
  title: string;
  source: string;
  date: string;
  excerpt: string;
  imageUrl?: string;
  category?: string;
  loading?: boolean;
  onClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  source,
  date,
  excerpt,
  imageUrl,
  category,
  loading = false,
  onClick,
}) => {
  const cardRef = React.useRef<HTMLIonCardElement>(null);

  React.useEffect(() => {
    if (cardRef.current) {
      const animation = createAnimation()
        .addElement(cardRef.current)
        .duration(300)
        .fromTo("opacity", "0", "1")
        .fromTo("transform", "translateY(20px)", "translateY(0)");

      animation.play();
    }
  }, []);

  if (loading) {
    return (
      <IonCard className="news-card">
        <div
          className="news-card-image skeleton-animation"
          style={{ height: "180px" }}
        ></div>
        <IonCardHeader>
          <IonSkeletonText animated style={{ width: "40%", height: "16px" }} />
          <IonSkeletonText
            animated
            style={{ width: "90%", height: "24px", marginTop: "8px" }}
          />
        </IonCardHeader>
        <IonCardContent>
          <IonSkeletonText animated style={{ width: "100%", height: "16px" }} />
          <IonSkeletonText animated style={{ width: "90%", height: "16px" }} />
          <IonSkeletonText animated style={{ width: "80%", height: "16px" }} />
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard className="news-card" ref={cardRef} onClick={onClick}>
      {imageUrl && (
        <div className="news-card-image-container">
          <img src={imageUrl} alt={title} className="news-card-image" />
          {category && (
            <IonChip className="news-card-category-chip" color="primary">
              <IonLabel>{category}</IonLabel>
            </IonChip>
          )}
        </div>
      )}

      <IonCardHeader>
        <IonCardSubtitle className="news-card-source">
          <span>{source}</span>
          <span className="news-card-date">
            <IonIcon icon={timeOutline} />
            {date}
          </span>
        </IonCardSubtitle>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <p className="news-card-excerpt">{excerpt}</p>

        <div className="news-card-actions">
          <IonButton fill="clear" size="small" className="action-button">
            <IonIcon slot="start" icon={bookmarkOutline} />
            Save
          </IonButton>
          <IonButton fill="clear" size="small" className="action-button">
            <IonIcon slot="start" icon={shareOutline} />
            Share
          </IonButton>
          <IonButton fill="clear" color="primary" className="read-more-button">
            Read more
            <IonIcon slot="end" icon={caretForwardCircle} />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default NewsCard;
