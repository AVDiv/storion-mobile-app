import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonIcon,
  IonButton,
  IonFab,
  IonFabButton,
  IonFabList,
  IonChip,
  IonLabel,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonSpinner,
  IonToast,
  useIonRouter,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  bookmarkOutline,
  shareOutline,
  textOutline,
  heartOutline,
  arrowBackOutline,
  linkOutline,
  chatbubbleOutline,
  arrowForward,
  image,
} from "ionicons/icons";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
// Import required Swiper modules
import { FreeMode } from "swiper/modules";

import "./styles/Article.css";
import {
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";
import { newsService } from "../services/api/newsService";
import { NewsEventArticle as NewsEventArticleType, NewsEvent } from "../types";
import RelatedArticleCard from "../components/RelatedArticleCard";

interface ArticleParams {
  id: string;
}

const Article: React.FC = () => {
  const { id } = useParams<ArticleParams>();
  const router = useIonRouter();
  const [scrollY, setScrollY] = useState(0);
  const [fontSize, setFontSize] = useState("medium"); // small, medium, large
  const [newsEvent, setNewsEvent] = useState<NewsEvent | null>(null);
  const [wasViewUpdated, setWasViewUpdated] = useState(false);
  const [associatedArticles, setAssociatedArticles] = useState<
    NewsEventArticleType[]
  >([]);
  const [associatedArticlesTotalCount, setAssociatedArticlesTotalCount] =
    useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the article data
        const newsEventData = await newsService.getNewsEventById(id);
        setNewsEvent(newsEventData);

        // If the article belongs to a news event, fetch related articles
        if (newsEventData.id) {
          const newsEventArticles = await newsService.getNewsEventArticles(
            newsEventData.id,
            5,
            0
          );
          setAssociatedArticlesTotalCount(newsEventArticles.totalCount);
          setAssociatedArticles(newsEventArticles.articles);
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Could not load the article. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsEvent();
  }, [id]);

  useEffect(() => {
    if (newsEvent && !loading && !wasViewUpdated) {
      posthogPageviewCaptureEvent({
        article_id: newsEvent.id,
        article_tags: newsEvent.keywords,
        article_title: newsEvent.title,
        article_categories: newsEvent.topics,
      });
      setWasViewUpdated(true);
    }
  }, [newsEvent, loading, wasViewUpdated]);

  const handleScroll = (event: CustomEvent) => {
    setScrollY(event.detail.scrollTop);
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
  };

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  // Calculate estimated read time (about 200 words per minute)
  const calculateReadTime = (content: string): string => {
    if (!content) return "1 min read";
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  };

  // Format the publication date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return dateString; // Return the original string if parsing fails
    }
  };

  // Format the publication date (simplified)
  const formatDateShort = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return "Invalid Date"; // Handle potential errors
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton
                defaultHref="/home"
                icon={arrowBackOutline}
                text=""
              />
            </IonButtons>
            <IonTitle>Loading Article</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="circular" />
            <p>Loading event...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !newsEvent) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton
                defaultHref="/home"
                icon={arrowBackOutline}
                text=""
              />
            </IonButtons>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="error-container">
            <h2>Sorry, something went wrong</h2>
            <p>{error || "Could not load the article."}</p>
            <IonButton routerLink="/home">Back to Home</IonButton>
          </div>
        </IonContent>
        <IonToast
          isOpen={!!error}
          message={error || ""}
          duration={3000}
          color="danger"
        />
      </IonPage>
    );
  }

  // Extract the first topic as the category if available, or use a default
  const category =
    newsEvent.topics && newsEvent.topics.length > 0
      ? newsEvent.topics[0].name
      : "News";

  const readTime = calculateReadTime(newsEvent.summary || "");
  const formattedDate = formatDate(newsEvent.createdAt);

  // Use default image if none provided
  const imageUrl = newsEvent.imageUrl || "";
  const isImageAvailable = imageUrl && imageUrl !== "";

  // Navigation handler for related articles
  const handleRelatedArticleClick = (articleId: string) => {
    router.push(`/article/${articleId}`, "forward", "replace");
  };

  return (
    <IonPage>
      <IonHeader
        className={`article-header ${scrollY > 50 ? "translucent" : ""}`}
      >
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/home"
              icon={arrowBackOutline}
              text=""
            />
          </IonButtons>

          <IonTitle
            className={`article-title ${scrollY > 150 ? "visible" : ""}`}
          >
            {newsEvent.title}
          </IonTitle>

          <IonButtons slot="end">
            <IonButton>
              <IonIcon slot="icon-only" icon={bookmarkOutline} />
            </IonButton>
            <IonButton>
              <IonIcon slot="icon-only" icon={shareOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        scrollEvents={true}
        onIonScroll={handleScroll}
        className={`article-content-wrapper font-size-${fontSize}`}
      >
        <div className={`article-hero ${isImageAvailable ? "has-image" : ""}`}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={newsEvent.title}
              className="article-image"
            />
          )}
          <div className="article-overlay"></div>
        </div>

        <div className="article-main-container">
          <div className="article-container">
            <div className="article-meta">
              <IonChip className="article-category">
                <IonLabel>{category}</IonLabel>
              </IonChip>
              <span className="article-read-time">{readTime}</span>
              {/* overallLanguageBias chips have been moved below header content */}
            </div>
            <div className="article-header-content">
              <h1>{newsEvent.title}</h1>
              <div className="article-info">
                <span className="article-date">{formattedDate}</span>
                {associatedArticlesTotalCount && (
                  <span className="article-source-count">
                    {associatedArticlesTotalCount} source
                    {associatedArticlesTotalCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Overall bias metrics below title */}
            {newsEvent.overallLanguageBias !== undefined && (
              <div
                className="article-bias-gauge-container"
                style={{
                  marginBottom: "20px",
                  marginTop: "10px",
                  borderRadius: "14px",
                  padding: "16px",
                  background: "var(--ion-background-color)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 14px 0",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "var(--ion-text-color)",
                  }}
                >
                  Language Bias Analysis
                </h4>

                {/* Gauge visualization */}
                <div
                  className="bias-gauge"
                  style={{
                    position: "relative",
                    height: "50px",
                    marginBottom: "12px",
                  }}
                >
                  {/* Gauge background */}
                  <div
                    style={{
                      position: "relative",
                      height: "16px",
                      marginTop: "10px",
                      marginBottom: "10px",
                      background:
                        "linear-gradient(to right, var(--ion-color-success), var(--ion-color-medium-tint), var(--ion-color-danger))",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
                      border: "1px solid var(--ion-color-step-200)",
                    }}
                  >
                    {/* Center marker */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "0",
                        bottom: "0",
                        width: "2px",
                        backgroundColor: "var(--ion-color-dark)",
                        transform: "translateX(-50%)",
                        zIndex: "1",
                      }}
                    />
                  </div>

                  {/* Gauge labels */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      color: "var(--ion-color-step-500)",
                      marginTop: "6px",
                      fontWeight: "500",
                    }}
                  >
                    <span>Without Bias</span>
                    <span>Moderate Bias</span>
                    <span>Extreme Bias</span>
                  </div>

                  {/* Needle indicator */}
                  <div
                    style={{
                      position: "absolute",
                      left: `${
                        ((newsEvent.overallLanguageBias + 1) / 2) * 100
                      }%`,
                      top: "0",
                      transform: "translateX(-50%)",
                      width: "3px",
                      height: "30px",
                      backgroundColor: "var(--ion-color-dark)",
                      borderRadius: "3px",
                      zIndex: "2",
                      transition: "left 0.5s ease-out",
                    }}
                  />

                  {/* Gauge value indicator (dot on top of needle) */}
                  <div
                    style={{
                      position: "absolute",
                      left: `${
                        ((newsEvent.overallLanguageBias + 1) / 2) * 100
                      }%`,
                      top: "0",
                      transform: "translateX(-50%)",
                      width: "14px",
                      height: "14px",
                      backgroundColor: getBiasColorClass(
                        newsEvent.overallLanguageBias
                      ),
                      borderRadius: "50%",
                      border: "2px solid var(--ion-color-step-50)",
                      zIndex: "3",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      transition: "left 0.5s ease-out",
                    }}
                  />
                </div>

                {/* Metrics display */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                    padding: "8px 4px 0",
                    borderTop: "1px solid var(--ion-color-step-100)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "var(--ion-color-step-600)",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor:
                          "rgba(var(--ion-color-success-rgb), 0.8)",
                        marginRight: "6px",
                      }}
                    ></div>
                    <span>{newsEvent.unbiasedArticlesCount || 0} low bias</span>
                  </div>

                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: "16px",
                      backgroundColor: getBiasBgColor(
                        newsEvent.overallLanguageBias
                      ),
                      color: getBiasColorClass(newsEvent.overallLanguageBias),
                      fontWeight: "500",
                    }}
                  >
                    {getBiasDescription(newsEvent.overallLanguageBias)}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "var(--ion-color-step-600)",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor:
                          "rgba(var(--ion-color-danger-rgb), 0.8)",
                        marginRight: "6px",
                      }}
                    ></div>
                    <span>{newsEvent.biasedArticlesCount || 0} high bias</span>
                  </div>
                </div>
              </div>
            )}

            {/* Political bias metrics below language bias */}
            {newsEvent.overallPoliticalBiasScore !== undefined &&
              newsEvent.topics &&
              newsEvent.topics.some(
                (topic) => topic.name.toLowerCase() === "politics"
              ) && (
                <div
                  className="article-bias-gauge-container"
                  style={{
                    marginBottom: "20px",
                    marginTop: "10px",
                    borderRadius: "14px",
                    padding: "16px",
                    background: "var(--ion-background-color)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 14px 0",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--ion-text-color)",
                    }}
                  >
                    Political Orientation Analysis
                  </h4>

                  {/* Gauge visualization */}
                  <div
                    className="bias-gauge"
                    style={{
                      position: "relative",
                      height: "50px",
                      marginBottom: "12px",
                    }}
                  >
                    {/* Gauge background */}
                    <div
                      style={{
                        position: "relative",
                        height: "16px",
                        marginTop: "10px",
                        marginBottom: "10px",
                        background:
                          "linear-gradient(to right, var(--ion-color-primary), var(--ion-color-medium-tint), var(--ion-color-danger))",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
                        border: "1px solid var(--ion-color-step-200)",
                      }}
                    >
                      {/* Center marker */}
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "0",
                          bottom: "0",
                          width: "2px",
                          backgroundColor: "var(--ion-color-dark)",
                          transform: "translateX(-50%)",
                          zIndex: "1",
                        }}
                      />
                    </div>

                    {/* Gauge labels */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "var(--ion-color-step-500)",
                        marginTop: "6px",
                        fontWeight: "500",
                      }}
                    >
                      <span>Far Left</span>
                      <span>Center</span>
                      <span>Far Right</span>
                    </div>

                    {/* Needle indicator */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${
                          ((newsEvent.overallPoliticalBiasScore + 1) / 2) * 100
                        }%`,
                        top: "0",
                        transform: "translateX(-50%)",
                        width: "3px",
                        height: "30px",
                        backgroundColor: "var(--ion-color-dark)",
                        borderRadius: "3px",
                        zIndex: "2",
                        transition: "left 0.5s ease-out",
                      }}
                    />

                    {/* Gauge value indicator (dot on top of needle) */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${
                          ((newsEvent.overallPoliticalBiasScore + 1) / 2) * 100
                        }%`,
                        top: "0",
                        transform: "translateX(-50%)",
                        width: "14px",
                        height: "14px",
                        backgroundColor: getPoliticalBiasColor(
                          newsEvent.overallPoliticalBiasScore
                        ),
                        borderRadius: "50%",
                        border: "2px solid var(--ion-color-step-50)",
                        zIndex: "3",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        transition: "left 0.5s ease-out",
                      }}
                    />
                  </div>

                  {/* Metrics display */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "13px",
                      padding: "8px 4px 0",
                      borderTop: "1px solid var(--ion-color-step-100)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "var(--ion-color-step-600)",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor:
                            "rgba(var(--ion-color-primary-rgb), 0.8)",
                          marginRight: "6px",
                        }}
                      ></div>
                      <span>
                        {newsEvent.leftLeaningArticlesCount || 0} left
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "3px 10px",
                        borderRadius: "16px",
                        backgroundColor: getPoliticalBiasBgColor(
                          newsEvent.overallPoliticalBiasScore
                        ),
                        color: getPoliticalBiasColor(
                          newsEvent.overallPoliticalBiasScore
                        ),
                        fontWeight: "500",
                      }}
                    >
                      {getPoliticalBiasDescription(
                        newsEvent.overallPoliticalBiasScore
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "var(--ion-color-step-600)",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor:
                            "rgba(var(--ion-color-danger-rgb), 0.8)",
                          marginRight: "6px",
                        }}
                      ></div>
                      <span>
                        {newsEvent.rightLeaningArticlesCount || 0} right
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Article body content */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{
                __html: newsEvent.summary || "<p>No content available</p>",
              }}
            ></div>

            {/* Associated articles */}
            {associatedArticles.length > 0 && (
              <div className="related-articles">
                <div className="related-articles-header">
                  <h3>Sources</h3>
                </div>
                <div className="related-articles-slider">
                  <Swiper
                    modules={[FreeMode]}
                    spaceBetween={12}
                    slidesPerView="auto"
                    freeMode={{
                      sticky: false,
                      momentumBounce: false,
                    }}
                    grabCursor={true}
                    className="related-swiper-container"
                  >
                    {associatedArticles.map((related) => (
                      <SwiperSlide
                        key={related.id}
                        className="related-article-slide"
                      >
                        <RelatedArticleCard
                          id={related.id}
                          title={related.title}
                          sourceName={related.sourceName}
                          publicationDate={formatDateShort(
                            related.publicationDate
                          )}
                          imageUrl={related.imageUrl}
                          topics={newsEvent.topics}
                          languageBias={related.languageBias}
                          politicalBiasConfidence={
                            related.politicalBiasConfidence
                          }
                          politicalBiasOrientation={
                            related.politicalBiasOrientation
                          }
                          onClick={handleRelatedArticleClick}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reading options fab */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={textOutline} />
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton onClick={() => changeFontSize("small")}>
              <span style={{ fontSize: "12px" }}>A</span>
            </IonFabButton>
            <IonFabButton onClick={() => changeFontSize("medium")}>
              <span style={{ fontSize: "16px" }}>A</span>
            </IonFabButton>
            <IonFabButton onClick={() => changeFontSize("large")}>
              <span style={{ fontSize: "20px" }}>A</span>
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Article;
