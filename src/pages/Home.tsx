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
  IonIcon,
  IonFab,
  IonFabButton,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonToast,
} from "@ionic/react";
import { arrowUpOutline } from "ionicons/icons";
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
  "All",
  "Technology",
  "Science",
  "Business",
  "Politics",
  "Health",
  "Sports",
  "Entertainment",
];

const Home: React.FC = () => {
  const { user } = useAuth();
  const [selectedSegment, setSelectedSegment] = useState<string>("trending");
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

        // Fetch data based on selected segment
        if (selectedSegment === "trending") {
          fetchedNews = await newsService.getTrendingNewsEvents();
        } else if (selectedSegment === "latest") {
          fetchedNews = await newsService.getLatestNewsEvents();
        } else if (selectedSegment === "following") {
          // For "following", we would need a different endpoint or parameter
          // As a fallback, just use latest news
          fetchedNews = await newsService.getLatestNewsEvents();
        }

        // If a category is selected (other than "All"), filter by category
        if (selectedCategory !== "All") {
          fetchedNews = await newsService.getNewsByCategory(selectedCategory);
        }

        // const articleResults = await Promise.all(articlesPromises);
        // const validArticles = articleResults.filter(
        //   (article) => article !== null
        // ) as NewsEvent[];

        // setNewsItems(validArticles);
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

  // Format relative time (e.g., "2h ago")
  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return "Just now";
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      }

      // For older articles, just return the date
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return "Unknown date";
    }
  };

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

      if (selectedSegment === "trending") {
        fetchedNews = await newsService.getTrendingNewsEvents();
      } else if (selectedSegment === "latest") {
        fetchedNews = await newsService.getLatestNewsEvents();
      } else {
        fetchedNews = await newsService.getLatestNewsEvents();
      }

      if (selectedCategory !== "All") {
        fetchedNews = await newsService.getNewsByCategory(selectedCategory);
      }

      const articlesPromises = fetchedNews.map(async (newsEvent) => {
        const articlesData = await newsService.getNewsEventArticles(
          newsEvent.id,
          1,
          0
        );
        if (articlesData.articles.length > 0) {
          const article = articlesData.articles[0];
          return {
            ...article,
            source: article.sourceName || "Unknown Source",
            date: formatRelativeTime(article.publicationDate),
            imageUrl:
              article.imageUrl ||
              "https://source.unsplash.com/random/1000x600?news",
            category:
              newsEvent.topics && newsEvent.topics.length > 0
                ? newsEvent.topics[0].name
                : "News",
            newsEventId: newsEvent.id,
          };
        }
        return null;
      });

      // const articleResults = await Promise.all(articlesPromises);
      // const validArticles = articleResults.filter(
      //   (article) => article !== null
      // ) as NewsEvent[];
      // setNewsItems(validArticles);
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
              className="custom-segment"
            >
              <IonSegmentButton value="trending">
                <IonLabel>Trending</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="latest">
                <IonLabel>Latest</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="following">
                <IonLabel>Following</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          <div className="categories-container">
            <div className="categories-scroll">
              {categories.map((category) => (
                <IonChip
                  key={category}
                  color={selectedCategory === category ? "primary" : "medium"}
                  className={`category-chip ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <IonLabel>{category}</IonLabel>
                </IonChip>
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
                    source=""
                    date=""
                    excerpt=""
                  />
                ))
            ) : filteredNews.length > 0 ? (
              filteredNews.map((item) => (
                <NewsCard
                  key={item.id}
                  title={item.title}
                  source={""}
                  date={item.createdAt}
                  excerpt={item.summary || ""}
                  imageUrl={item.imageUrl}
                  category={item.topics[0]["name"]}
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
              <IonIcon icon={arrowUpOutline} />
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
