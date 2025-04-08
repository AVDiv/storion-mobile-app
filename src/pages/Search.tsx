import {
  IonContent,
  IonPage,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import NewsCard from "../components/NewsCard";
import { trendingUpOutline, timeOutline, flame } from "ionicons/icons";
import "./styles/Search.css";
import {
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";

// Trending search terms
const trendingSearches = [
  "Climate Change",
  "Space Exploration",
  "Artificial Intelligence",
  "Cryptocurrency",
  "Quantum Computing",
  "Renewable Energy",
];

// Recent search terms (would be stored in user's profile in a real app)
const recentSearches = [
  "Electric Vehicles",
  "Vaccine Development",
  "Neural Networks",
  "Global Markets",
];

// Topic suggestions
const suggestedTopics = [
  "Technology",
  "Science",
  "Business",
  "Health",
  "Politics",
  "Entertainment",
  "Sports",
];

const Search: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleScroll = (event: CustomEvent) => {
    setScrollY(event.detail.scrollTop);
  };

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  // Simulate search action
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Show loading state
    setIsSearching(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock results based on query
      const mockResults = [
        {
          id: 101,
          title: `Latest on ${query}: New Developments`,
          source: "Tech Journal",
          date: "2h ago",
          excerpt: `Recent advancements in ${query} have shown promising results for future applications in various industries.`,
          imageUrl: `https://source.unsplash.com/random/1000x600?${query.replace(
            /\s+/g,
            ","
          )}`,
        },
        {
          id: 102,
          title: `The Impact of ${query} on Global Economy`,
          source: "Economy Today",
          date: "5h ago",
          excerpt: `Analysts predict that ${query} will significantly influence market trends in the coming years.`,
          imageUrl: `https://source.unsplash.com/random/1000x600?business,${query.replace(
            /\s+/g,
            ","
          )}`,
        },
      ];

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  // Handle clicking on a trending or recent search
  const handleSearchClick = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  return (
    <IonPage>
      <PageHeader title="Search" showSearch={false} />

      <IonContent
        className="search-page"
        scrollEvents={true}
        onIonScroll={handleScroll}
      >
        <div className="search-container">
          <IonSearchbar
            value={searchQuery}
            onIonChange={(e) => handleSearch(e.detail.value || "")}
            placeholder="Search for news..."
            animated={true}
            showCancelButton="focus"
            className="custom-searchbar"
            debounce={500}
          ></IonSearchbar>
        </div>

        {!searchQuery ? (
          <>
            <div className="search-suggestions">
              <IonSegment
                value={activeTab}
                onIonChange={(e) => setActiveTab(e.detail.value as string)}
                className="search-tabs"
              >
                <IonSegmentButton value="trending">
                  <IonIcon icon={trendingUpOutline} />
                  <IonLabel>Trending</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="recent">
                  <IonIcon icon={timeOutline} />
                  <IonLabel>Recent</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="topics">
                  <IonIcon icon={flame} />
                  <IonLabel>Topics</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              {activeTab === "trending" && (
                <div className="search-chips">
                  {trendingSearches.map((term) => (
                    <IonChip
                      key={term}
                      color="primary"
                      outline={true}
                      onClick={() => handleSearchClick(term)}
                    >
                      <IonLabel>{term}</IonLabel>
                    </IonChip>
                  ))}
                </div>
              )}

              {activeTab === "recent" && (
                <IonList lines="full" className="recent-searches">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((term) => (
                      <IonItem
                        key={term}
                        detail={true}
                        button
                        onClick={() => handleSearchClick(term)}
                      >
                        <IonIcon
                          icon={timeOutline}
                          slot="start"
                          color="medium"
                        />
                        <IonLabel>{term}</IonLabel>
                      </IonItem>
                    ))
                  ) : (
                    <div className="no-results">
                      <p>No recent searches</p>
                    </div>
                  )}
                </IonList>
              )}

              {activeTab === "topics" && (
                <div className="search-chips topics">
                  {suggestedTopics.map((topic) => (
                    <IonChip
                      key={topic}
                      color="secondary"
                      onClick={() => handleSearchClick(topic)}
                      className="topic-chip"
                    >
                      <IonLabel>{topic}</IonLabel>
                    </IonChip>
                  ))}
                </div>
              )}
            </div>

            <div className="search-help">
              <h4>Search Tips</h4>
              <p>
                Try searching for topics, events, or specific keywords to find
                relevant news articles.
              </p>
            </div>
          </>
        ) : (
          <div className="search-results">
            {isSearching ? (
              // Show skeleton loaders while searching
              Array(2)
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
            ) : searchResults.length > 0 ? (
              // Show search results
              <>
                <div className="results-header">
                  <h4>Results for "{searchQuery}"</h4>
                  <span className="results-count">
                    {searchResults.length} articles
                  </span>
                </div>

                {searchResults.map((item) => (
                  <NewsCard
                    key={item.id}
                    title={item.title}
                    source={item.source}
                    date={item.date}
                    excerpt={item.excerpt}
                    imageUrl={item.imageUrl}
                    onClick={() =>
                      (window.location.href = `/article/${item.id}`)
                    }
                  />
                ))}
              </>
            ) : (
              // No results found
              <div className="no-results">
                <h3>No results found</h3>
                <p>Try different keywords or check your spelling</p>
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Search;
