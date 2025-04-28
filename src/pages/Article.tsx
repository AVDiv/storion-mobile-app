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
  bookmarkOutline,
  shareOutline,
  textOutline,
  heartOutline,
  arrowBackOutline,
  linkOutline,
  chatbubbleOutline,
  arrowForward,
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

  const handleScroll = (event: CustomEvent) => {
    setScrollY(event.detail.scrollTop);
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
  };

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

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
  const imageUrl =
    newsEvent.imageUrl || "https://source.unsplash.com/random/1200x600?news";

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
        <div className="article-hero">
          <img src={imageUrl} alt={newsEvent.title} className="article-image" />
          <div className="article-overlay"></div>
        </div>

        <div className="article-main-container">
          <div className="article-container">
            <div className="article-meta">
              <IonChip className="article-category">
                <IonLabel>{category}</IonLabel>
              </IonChip>
              <span className="article-read-time">{readTime}</span>
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
