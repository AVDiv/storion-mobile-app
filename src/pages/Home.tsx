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
} from "@ionic/react";
import { arrowUpOutline, filterOutline } from "ionicons/icons";
import PageHeader from "../components/PageHeader";
import NewsCard from "../components/NewsCard";
import "./styles/Home.css";
import {
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";

// Mock categories for the filters
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

// Mock data for news items
const mockNewsItems = [
  {
    id: 1,
    title: "The Future of Artificial Intelligence in Healthcare",
    source: "Tech Today",
    date: "2h ago",
    excerpt:
      "New AI systems are revolutionizing how doctors diagnose and treat patients, leading to faster and more accurate care.",
    imageUrl: "https://source.unsplash.com/random/1000x600?ai,health",
    category: "Technology",
  },
  {
    id: 2,
    title: "Global Markets Rally as New Trade Agreements Finalized",
    source: "Business Insider",
    date: "3h ago",
    excerpt:
      "Stock markets worldwide saw significant gains today as countries agreed on new international trade policies.",
    imageUrl: "https://source.unsplash.com/random/1000x600?finance,market",
    category: "Business",
  },
  {
    id: 3,
    title: "Breakthrough in Renewable Energy Storage Solutions",
    source: "Science Daily",
    date: "5h ago",
    excerpt:
      "Researchers have developed a new battery technology that could make renewable energy more reliable and accessible.",
    imageUrl: "https://source.unsplash.com/random/1000x600?energy,renewable",
    category: "Science",
  },
  {
    id: 4,
    title: "Major Sports League Announces Expansion Teams",
    source: "Sports Network",
    date: "6h ago",
    excerpt:
      "The league will add two new franchises in growing markets, with play scheduled to begin in the next season.",
    imageUrl: "https://source.unsplash.com/random/1000x600?sports,stadium",
    category: "Sports",
  },
  {
    id: 5,
    title: "New Treatment Shows Promise for Chronic Condition",
    source: "Health Journal",
    date: "8h ago",
    excerpt:
      "Clinical trials have demonstrated significant improvement in patients suffering from the previously difficult-to-treat illness.",
    imageUrl: "https://source.unsplash.com/random/1000x600?medicine,health",
    category: "Health",
  },
];

const Home: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>("trending");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState(0);

  // Simulate data loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setNewsItems(mockNewsItems);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedSegment, selectedCategory]);

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  // Handle scroll to show/hide scroll-to-top button
  const handleScroll = (e: CustomEvent) => {
    const scrollTop = e.detail.scrollTop;
    setScrollY(scrollTop);
    setShowScrollTop(scrollTop > 300);
  };

  // Handle pull-to-refresh
  const handleRefresh = (event: CustomEvent) => {
    setIsLoading(true);
    setTimeout(() => {
      setNewsItems(mockNewsItems);
      setIsLoading(false);
      event.detail.complete();
    }, 1500);
  };

  // Scroll to top function
  const scrollToTop = () => {
    const content = document.querySelector("ion-content");
    content?.scrollToTop(500);
  };

  // Filter news based on search query and category
  const filteredNews = newsItems.filter((item) => {
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <IonPage>
      <PageHeader title="News Feed" onSearchChange={setSearchQuery} />

      <IonContent
        className="page-transition"
        scrollEvents={true}
        onIonScroll={handleScroll}
      >
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
            // Render skeleton loaders when loading
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
            // Render actual news items
            filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                title={item.title}
                source={item.source}
                date={item.date}
                excerpt={item.excerpt}
                imageUrl={item.imageUrl}
                category={item.category}
                onClick={() => (window.location.href = `/article/${item.id}`)}
              />
            ))
          ) : (
            // No results found
            <div className="no-results">
              <h3>No articles found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Scroll to top button */}
        {showScrollTop && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={scrollToTop} size="small">
              <IonIcon icon={arrowUpOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
