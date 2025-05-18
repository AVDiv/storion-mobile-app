import React from "react";
import { IonCard, IonCardContent, IonLabel, IonIcon } from "@ionic/react";
import { timeOutline } from "ionicons/icons";
import { getBiasDescription, getBiasColorClass } from "../utils/biasUtils";
import {
  getPoliticalBiasDescription,
  getPoliticalBiasColor,
  getPoliticalBiasScore,
} from "../utils/politicalBiasUtils";
import "./RelatedArticleCard.css";

interface RelatedArticleCardProps {
  id: string;
  title: string;
  sourceName: string | null;
  publicationDate: string;
  imageUrl?: string;
  topics?: { name: string; score: number }[]; // Added topics array
  // Language bias
  languageBias?: number;
  // Political bias
  politicalBiasConfidence?: number;
  politicalBiasOrientation?: "left" | "right" | "center";
  onClick: (id: string) => void;
}

const RelatedArticleCard: React.FC<RelatedArticleCardProps> = ({
  id,
  title,
  sourceName,
  publicationDate,
  imageUrl,
  topics = [],
  languageBias,
  politicalBiasConfidence,
  politicalBiasOrientation,
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
        {languageBias !== undefined && (
          <div
            className="related-article-bias"
            style={{
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <div
              style={{
                flex: "1",
                height: "4px",
                background:
                  "linear-gradient(to right, var(--ion-color-success), var(--ion-color-medium-tint), var(--ion-color-danger))",
                borderRadius: "2px",
                position: "relative",
                boxShadow: "inset 0 1px 1px rgba(0,0,0,0.15)",
                border: "1px solid var(--ion-color-step-200)",
              }}
            >
              {/* Center marker */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  height: "4px",
                  width: "1px",
                  backgroundColor: "var(--ion-color-dark)",
                  zIndex: "1",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: `${((languageBias + 1) / 2) * 100}%`,
                  transform: "translateX(-50%)",
                  width: "8px",
                  height: "8px",
                  backgroundColor:
                    languageBias > 0.3
                      ? "var(--ion-color-danger)"
                      : languageBias > -0.3
                      ? "var(--ion-color-warning)"
                      : "var(--ion-color-success)",
                  border: "1.5px solid var(--ion-color-step-50)",
                  borderRadius: "50%",
                  top: "-2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  zIndex: "2",
                }}
              ></div>
            </div>
            <span
              style={{
                fontSize: "9px",
                color: getBiasColorClass(languageBias),
                fontWeight: "500",
              }}
            >
              {getBiasDescription(languageBias)}
            </span>
          </div>
        )}

        {/* Political bias indicator - only shown for politics topics */}
        {politicalBiasOrientation &&
          politicalBiasConfidence &&
          topics.some((topic) => topic.name.toLowerCase() === "politics") && (
            <div
              className="related-article-political-bias"
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  flex: "1",
                  height: "4px",
                  background:
                    "linear-gradient(to right, var(--ion-color-primary), var(--ion-color-medium-tint), var(--ion-color-danger))",
                  borderRadius: "2px",
                  position: "relative",
                  boxShadow: "inset 0 1px 1px rgba(0,0,0,0.15)",
                  border: "1px solid var(--ion-color-step-200)",
                }}
              >
                {/* Center marker */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    height: "4px",
                    width: "1px",
                    backgroundColor: "var(--ion-color-dark)",
                    zIndex: "1",
                  }}
                ></div>
                {/* Political bias position indicator */}
                <div
                  style={{
                    position: "absolute",
                    left: `${
                      ((getPoliticalBiasScore(
                        politicalBiasOrientation,
                        politicalBiasConfidence
                      ) +
                        1) /
                        2) *
                      100
                    }%`,
                    transform: "translateX(-50%)",
                    width: "8px",
                    height: "8px",
                    backgroundColor: getPoliticalBiasColor(
                      getPoliticalBiasScore(
                        politicalBiasOrientation,
                        politicalBiasConfidence
                      )
                    ),
                    border: "1.5px solid var(--ion-color-step-50)",
                    borderRadius: "50%",
                    top: "-2px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    zIndex: "2",
                  }}
                ></div>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  color: getPoliticalBiasColor(
                    getPoliticalBiasScore(
                      politicalBiasOrientation,
                      politicalBiasConfidence
                    )
                  ),
                  fontWeight: "500",
                }}
              >
                {getPoliticalBiasDescription(
                  getPoliticalBiasScore(
                    politicalBiasOrientation,
                    politicalBiasConfidence
                  )
                )}
              </span>
            </div>
          )}
      </IonCardContent>
    </IonCard>
  );
};

export default RelatedArticleCard;
