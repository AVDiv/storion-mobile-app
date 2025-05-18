import {
  IonContent,
  IonPage,
  IonSearchbar,
  IonList,
  IonLabel,
  IonChip,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import NewsCard from "../components/NewsCard";
import "./styles/Search.css";
import {
  posthogCaptureEvent,
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";
import { apiService } from "../services/api/apiService";

// Import our new component files
import ArticleCard from "../components/search/ArticleCard";
import TopicCard from "../components/search/TopicCard";
import SourceCard from "../components/search/SourceCard";

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

// Define interfaces for search API response types
interface ArticleGroup {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  articleCount: number;
  topics: Array<{ name: string; score: number }>;
  relevanceScore: number;
}

interface Topic {
  name: string;
  description: string;
  createdAt: string;
  articleGroupCount: number;
  relevanceScore: number;
}

interface Source {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  articleCount: number;
  relevanceScore: number;
}

interface SearchResponse {
  articleGroups: ArticleGroup[];
  topics: Topic[];
  sources: Source[];
  total: number;
}

interface Section {
  type: "articleGroups" | "topics" | "sources";
  title: string;
  data: ArticleGroup[] | Topic[] | Source[];
  relevanceScore: number;
}

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [sections, setSections] = useState<Section[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  // Calculate the highest relevance score for each section
  const getSectionRelevanceScore = (items: any[]): number => {
    if (!items || items.length === 0) return 0;
    return Math.max(...items.map((item) => item.relevanceScore || 0));
  };

  // Sort sections by relevance score with priority for equal scores
  const sortSections = (sections: Section[]): Section[] => {
    return sections.sort((a, b) => {
      if (b.relevanceScore === a.relevanceScore) {
        // If scores are equal, use priority: 1.Topic, 2.Source, 3.Article
        const priority = { topics: 1, sources: 2, articleGroups: 3 };
        return priority[a.type] - priority[b.type];
      }
      return b.relevanceScore - a.relevanceScore;
    });
  };

  // Search using the API
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);

    if (query.trim() === "") {
      setSearchResults(null);
      setSections([]);
      setIsSearching(false);
      return;
    }

    // Show loading state
    setIsSearching(true);

    try {
      // Call the search API endpoint
      const response = await apiService.get<SearchResponse>(
        `/search?query=${encodeURIComponent(query)}&type=all&limit=20`
      );
      setSearchResults(response);

      if (response) posthogCaptureEvent("user.search", { query });

      // Create sections and sort them by relevance score
      const newSections: Section[] = [];

      if (response.articleGroups && response.articleGroups.length > 0) {
        newSections.push({
          type: "articleGroups",
          title: "Articles",
          data: response.articleGroups,
          relevanceScore: getSectionRelevanceScore(response.articleGroups),
        });
      }

      if (response.topics && response.topics.length > 0) {
        newSections.push({
          type: "topics",
          title: "Topics",
          data: response.topics,
          relevanceScore: getSectionRelevanceScore(response.topics),
        });
      }

      if (response.sources && response.sources.length > 0) {
        newSections.push({
          type: "sources",
          title: "Sources",
          data: response.sources,
          relevanceScore: getSectionRelevanceScore(response.sources),
        });
      }

      // Sort sections by relevance score with priority rules
      setSections(sortSections(newSections));
    } catch (error) {
      console.error("Search API error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to perform search"
      );
      setSearchResults(null);
      setSections([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clicking on a trending or recent search
  const handleSearchClick = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  // Generate a placeholder image based on text
  const getPlaceholderImage = (text: string): string => {
    return `https://source.unsplash.com/random/1000x600?${text.replace(
      /\s+/g,
      ","
    )}`;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHrs < 24) {
        return `${diffHrs}h ago`;
      } else {
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays}d ago`;
      }
    } catch (e) {
      return "Recent";
    }
  };

  return (
    <IonPage>
      <PageHeader title="Search" showSearch={false} />

      <IonContent className="search-page" scrollEvents={true}>
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
              Array(3)
                .fill(null)
                .map((_, index) => (
                  <NewsCard
                    key={`skeleton-${index}`}
                    loading={true}
                    title=""
                    sources={null}
                    date=""
                  />
                ))
            ) : error ? (
              // Show error message
              <div className="search-error">
                <h3>Error</h3>
                <p>{error}</p>
              </div>
            ) : sections.length > 0 ? (
              // Show search results organized by sections
              <>
                <div className="results-header">
                  <h4>Results for "{searchQuery}"</h4>
                  <span className="results-count">
                    {searchResults?.total || 0} results
                  </span>
                </div>

                {sections.map((section, sectionIndex) => (
                  <div
                    key={`section-${section.type}-${sectionIndex}`}
                    className="result-section"
                  >
                    <h3 className="search-section-title">{section.title}</h3>

                    {section.type === "articleGroups" && (
                      <div className="articles-list">
                        {(section.data as ArticleGroup[]).map((article) => (
                          <ArticleCard key={article.id} article={article} />
                        ))}
                      </div>
                    )}

                    {section.type === "topics" && (
                      <div className="topics-results">
                        {(section.data as Topic[]).map((topic) => (
                          <TopicCard
                            key={topic.name}
                            topic={topic}
                            onClick={handleSearchClick}
                          />
                        ))}
                      </div>
                    )}

                    {section.type === "sources" && (
                      <IonList lines="full" className="sources-list">
                        {(section.data as Source[]).map((source) => (
                          <SourceCard key={source.id} source={source} />
                        ))}
                      </IonList>
                    )}
                  </div>
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
