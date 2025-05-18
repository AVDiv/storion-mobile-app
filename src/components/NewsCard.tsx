import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonChip,
  IonLabel,
  IonSkeletonText,
  createAnimation,
} from "@ionic/react";
import "./NewsCard.css";
import calculateTimeAgo from "../utils/time";
import {
  getBiasDescription,
  getBiasColorClass,
  getBiasBgColor,
} from "../utils/biasUtils";
import {
  getPoliticalBiasDescription,
  getPoliticalBiasColor,
  getPoliticalBiasBgColor,
} from "../utils/politicalBiasUtils";
import {
  Calendar as CalendarIcon,
  Bookmark as BookmarkIcon,
  ShareIos as ShareIcon,
} from "iconoir-react";

interface NewsCardProps {
  title: string;
  sources: number | null;
  date: string;
  imageUrl?: string;
  category?: string;
  loading?: boolean;
  onClick?: () => void;
  topics?: { name: string; score: number }[]; // Added topics array
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
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  sources,
  date,
  imageUrl,
  category,
  loading = false,
  onClick,
  overallLanguageBias,
  overallPoliticalBiasScore,
  topics = [],
}) => {
  const cardRef = React.useRef<HTMLIonCardElement>(null);
  const newsEventDate = date ? new Date(date) : "";
  const oneWeekAgo = new Date(Date.now() - 604800000); // 7 days in milliseconds
  console.log("Date", date);
  console.log("newsEventDate", newsEventDate);
  const formattedDate = newsEventDate
    ? newsEventDate < oneWeekAgo
      ? newsEventDate.toLocaleDateString("en-US", { dateStyle: "long" })
      : calculateTimeAgo(newsEventDate)
    : "Unknown date";

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
          {/* <img src={imageUrl} alt={title} className="news-card-image" /> */}
          {category && (
            <IonChip className="news-card-category-chip" color="primary">
              <IonLabel>{category}</IonLabel>
            </IonChip>
          )}
        </div>
      )}

      <IonCardHeader>
        <IonCardSubtitle className="news-card-source">
          <span>
            {sources ? `${sources} Source${sources > 1 ? "s" : ""}` : ""}
          </span>
          <span className="news-card-date">
            <CalendarIcon className="icon" strokeWidth={2} />
            {newsEventDate ? formattedDate : "Unknown date"}
          </span>
        </IonCardSubtitle>
        <IonCardTitle>{title}</IonCardTitle>
        {overallLanguageBias !== undefined && (
          <div
            className="news-card-bias-indicator"
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {/* Mini gauge visualization */}
            <div
              style={{
                flex: 1,
                height: "6px",
                background:
                  "linear-gradient(to right, var(--ion-color-success), var(--ion-color-medium-tint), var(--ion-color-danger))",
                borderRadius: "3px",
                position: "relative",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)",
                border: "1px solid var(--ion-color-step-200)",
              }}
            >
              {/* Center marker */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  height: "6px",
                  width: "1px",
                  backgroundColor: "var(--ion-color-dark)",
                  zIndex: "1",
                }}
              ></div>
              {/* Bias position indicator */}
              <div
                style={{
                  position: "absolute",
                  left: `${((overallLanguageBias + 1) / 2) * 100}%`,
                  transform: "translateX(-50%)",
                  width: "10px",
                  height: "10px",
                  backgroundColor:
                    overallLanguageBias > 0.3
                      ? "var(--ion-color-danger)"
                      : overallLanguageBias > -0.3
                      ? "var(--ion-color-warning)"
                      : "var(--ion-color-success)",
                  border: "1.5px solid var(--ion-color-step-50)",
                  borderRadius: "50%",
                  top: "-2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  zIndex: "2",
                }}
              ></div>
            </div>
            {/* Bias labels */}
            <div
              style={{
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                padding: "2px 6px",
                borderRadius: "10px",
                backgroundColor: getBiasBgColor(overallLanguageBias),
                color: getBiasColorClass(overallLanguageBias),
                fontWeight: "500",
              }}
            >
              {getBiasDescription(overallLanguageBias)}
            </div>
          </div>
        )}

        {/* Political bias indicator - only shown for politics topics */}
        {overallPoliticalBiasScore !== undefined &&
          topics.some((topic) => topic.name.toLowerCase() === "politics") && (
            <div
              className="news-card-political-bias-indicator"
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* Mini gauge visualization */}
              <div
                style={{
                  flex: 1,
                  height: "6px",
                  background:
                    "linear-gradient(to right, var(--ion-color-primary), var(--ion-color-medium-tint), var(--ion-color-danger))",
                  borderRadius: "3px",
                  position: "relative",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)",
                  border: "1px solid var(--ion-color-step-200)",
                }}
              >
                {/* Center marker */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    height: "6px",
                    width: "1px",
                    backgroundColor: "var(--ion-color-dark)",
                    zIndex: "1",
                  }}
                ></div>
                {/* Political bias position indicator */}
                <div
                  style={{
                    position: "absolute",
                    left: `${((overallPoliticalBiasScore + 1) / 2) * 100}%`,
                    transform: "translateX(-50%)",
                    width: "10px",
                    height: "10px",
                    backgroundColor: getPoliticalBiasColor(
                      overallPoliticalBiasScore
                    ),
                    border: "1.5px solid var(--ion-color-step-50)",
                    borderRadius: "50%",
                    top: "-2px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                    zIndex: "2",
                  }}
                ></div>
              </div>
              {/* Political bias label */}
              <div
                style={{
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  backgroundColor: getPoliticalBiasBgColor(
                    overallPoliticalBiasScore
                  ),
                  color: getPoliticalBiasColor(overallPoliticalBiasScore),
                  fontWeight: "500",
                }}
              >
                {getPoliticalBiasDescription(overallPoliticalBiasScore)}
              </div>
            </div>
          )}
      </IonCardHeader>

      <IonCardContent>
        <div className="news-card-actions">
          <IonButton fill="clear" size="small" className="action-button">
            <BookmarkIcon className="icon" strokeWidth={2.5} width="1.4em" />
          </IonButton>
          <IonButton fill="clear" size="small" className="action-button">
            <ShareIcon className="icon" strokeWidth={2.5} width="1.4em" />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default NewsCard;
