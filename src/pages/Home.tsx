import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonFab,
  IonFabButton,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonToast,
} from "@ionic/react";
import {
  DotsGrid3x3 as DotGridIcon,
  SparksSolid as SparkIcon,
  ArrowUp as ArrowUpIcon,
} from "iconoir-react";
import NewsCard from "../components/NewsCard";
import HomeHeader from "../components/pages/home/Header";
import { useAuth } from "../services/auth/authContext";
import "./styles/Home.css";
import {
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";
import { newsService } from "../services/api/newsService";
import { NewsEvent } from "../types";

// Categories for the filters
const categories = [
  [DotGridIcon, "All"],
  [null, "Technology"],
  [null, "Science"],
  [null, "Business"],
  [null, "Politics"],
  [null, "Health"],
  [null, "Sports"],
  [null, "Entertainment"],
];

const Home: React.FC = () => {
  const { user } = useAuth();
  const [selectedSegment, setSelectedSegment] = useState<string>("forYou");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newsItems, setNewsItems] = useState<NewsEvent[]>([]);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState(0);
  const [isHeaderTranslucent, setIsHeaderTranslucent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load news data based on the selected segment and category
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let fetchedNews: NewsEvent[] = [];
        let feedType: string;

        // Map selected segment to Feed API type parameter
        switch (selectedSegment) {
          case "forYou":
            feedType = "recommended";
            break;
          case "trending":
            feedType = "trending";
            break;
          case "latest":
            feedType = "latest";
            break;
          default:
            feedType = "mixed";
        }

        // Build query parameters for the Feed API
        const params = new URLSearchParams();
        params.append("type", feedType);
        params.append("timeRange", "week");
        params.append("limit", "20");
        params.append("offset", "0");
        params.append("excludeRead", "true");

        // Add topic parameter if a specific category is selected
        if (selectedCategory !== "All") {
          params.append("topic", selectedCategory);
        }

        // Fetch news using the Feed API
        try {
          fetchedNews = await newsService.getFeedContent(params.toString());
        } catch (error) {
          console.error("Error fetching feed content:", error);
          // Fallback to existing methods if the Feed API fails
          if (selectedSegment === "trending") {
            fetchedNews = await newsService.getTrendingNewsEvents();
          } else if (selectedSegment === "latest") {
            fetchedNews = await newsService.getLatestNewsEvents();
          } else {
            // For "forYou", use mixed content as fallback
            fetchedNews = await newsService.getLatestNewsEvents();
          }

          // If a category is selected, filter by category
          if (selectedCategory !== "All") {
            fetchedNews = await newsService.getNewsByCategory(selectedCategory);
          }
        }

        setNewsItems(fetchedNews);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Could not load news. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNewsData();
  }, [selectedSegment, selectedCategory]);

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  // Handle scroll to show/hide scroll-to-top button and set header translucency
  const handleScroll = (e: CustomEvent) => {
    const scrollTop = e.detail.scrollTop;
    setScrollY(scrollTop);
    setShowScrollTop(scrollTop > 300);
    setIsHeaderTranslucent(scrollTop > 50);
  };

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    setIsLoading(true);
    try {
      let fetchedNews: NewsEvent[] = [];
      let feedType: string;

      // Map selected segment to Feed API type parameter
      switch (selectedSegment) {
        case "forYou":
          feedType = "recommended";
          break;
        case "trending":
          feedType = "trending";
          break;
        case "latest":
          feedType = "latest";
          break;
        default:
          feedType = "mixed";
      }

      // Build query parameters for the Feed API
      const params = new URLSearchParams();
      params.append("type", feedType);
      params.append("timeRange", "week");
      params.append("limit", "20");
      params.append("offset", "0");
      params.append("excludeRead", "true");

      // Add topic parameter if a specific category is selected
      if (selectedCategory !== "All") {
        params.append("topic", selectedCategory);
      }

      // Fetch news using the Feed API
      try {
        fetchedNews = await newsService.getFeedContent(params.toString());
        setNewsItems(fetchedNews);
      } catch (error) {
        console.error("Error refreshing feed content:", error);
        // Fallback handling if needed
      }

      setError(null);
    } catch (err) {
      console.error("Failed to refresh news:", err);
      setError("Could not refresh news. Please try again later.");
    } finally {
      setIsLoading(false);
      event.detail.complete();
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    const content = document.querySelector("ion-content");
    content?.scrollToTop(500);
  };

  // Filter news based on search query
  const filteredNews = newsItems.filter((item) => {
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false)
      : true;
    return matchesSearch;
  });

  return (
    <IonPage>
      <HomeHeader isTranslucent={isHeaderTranslucent} userName={user?.name} />

      <IonContent
        className="page-transition"
        scrollEvents={true}
        onIonScroll={handleScroll}
        fullscreen
      >
        <div>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>

          <div className="segment-container">
            <IonSegment
              value={selectedSegment}
              onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
              className="feed-segment"
            >
              <IonSegmentButton value="forYou" layout="icon-start">
                <SparkIcon />
                <IonLabel>For You</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="trending">
                <IonLabel>Trending</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="latest">
                <IonLabel>Latest</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          <div className="categories-container">
            <div className="categories-scroll">
              {categories.map(([categoryIcon, categoryName]) => (
                <React.Fragment key={categoryName as string}>
                  <IonChip
                    color={
                      selectedCategory === categoryName ? "primary" : "medium"
                    }
                    className={`category-chip ${
                      selectedCategory === categoryName ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(categoryName as string)}
                  >
                    <div>
                      {categoryIcon &&
                        React.createElement(categoryIcon, {
                          className: `category-icon ${
                            selectedCategory === categoryName ? "active" : ""
                          }`,
                          width: "16px",
                          strokeWidth: 3,
                        })}
                      <IonLabel>{categoryName as string}</IonLabel>
                    </div>
                  </IonChip>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="news-container">
            {isLoading ? (
              Array(3)
                .fill(null)
                .map((_, index) => (
                  <NewsCard
                    key={`skeleton-${index}`}
                    loading={true}
                    title=""
                    sources={0}
                    date=""
                  />
                ))
            ) : filteredNews.length > 0 ? (
              filteredNews.map((item) => (
                <NewsCard
                  key={item.id}
                  title={item.title}
                  sources={item.articleCount}
                  date={item.createdAt}
                  imageUrl={item.imageUrl}
                  category={
                    item.topics && item.topics.length > 0
                      ? item.topics[0].name
                      : "News"
                  }
                  overallLanguageBias={item.overallLanguageBias}
                  unbiasedArticlesCount={item.unbiasedArticlesCount}
                  biasedArticlesCount={item.biasedArticlesCount}
                  onClick={() => (window.location.href = `/article/${item.id}`)}
                />
              ))
            ) : (
              <div className="no-results">
                <h3>No articles found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {showScrollTop && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={scrollToTop} size="small">
              <ArrowUpIcon />
            </IonFabButton>
          </IonFab>
        )}

        <IonToast
          isOpen={!!error}
          message={error || ""}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
