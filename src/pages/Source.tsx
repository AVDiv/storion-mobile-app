import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonChip,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonNote,
} from "@ionic/react";
import { useParams } from "react-router";
import {
  arrowBackOutline,
  calendarOutline,
  timeOutline,
  layersOutline,
  filterOutline,
  chevronForward,
  albumsOutline,
  reorderFourOutline,
} from "ionicons/icons";
import { apiService } from "../services/api/apiService";
import {
  posthogPageviewCaptureEvent,
  posthogPageleaveCaptureEvent,
} from "../services/analytics/posthogAnalytics";
import "./styles/Source.css";

interface Source {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt?: string;
  articleCount: number;
  relevanceScore?: number;
}

interface Article {
  id: string;
  title: string;
  url: string;
  publicationDate: string;
  updatedAt?: string;
  group?: {
    id: string;
    title: string;
  };
}

interface ArticlesResponse {
  articles: Article[];
  meta: {
    limit: number;
    offset: number;
  };
}

const SourcePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [source, setSource] = useState<Source | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  // Track loaded article IDs to prevent duplicates
  const [loadedArticleIds, setLoadedArticleIds] = useState<Set<string>>(
    new Set()
  );

  const fetchSource = async () => {
    try {
      const data = await apiService.get<Source>(`/source/${id}`);
      setSource(data);
      return data;
    } catch (error) {
      setError("Failed to load source information");
      console.error("Error fetching source:", error);
      return null;
    }
  };

  const fetchArticles = async (
    pageNum: number = 1,
    refresh: boolean = false
  ) => {
    try {
      const pageSize = 15;
      const offset = (pageNum - 1) * pageSize;
      const data = await apiService.get<ArticlesResponse>(
        `/source/${id}/articles?limit=${pageSize}&offset=${offset}`
      );

      if (data && data.articles) {
        const newArticles = data.articles;

        if (refresh) {
          // Reset everything on refresh
          setArticles(newArticles);
          setLoadedArticleIds(
            new Set(newArticles.map((article) => article.id))
          );
        } else {
          // Filter out any duplicates
          const uniqueNewArticles = newArticles.filter(
            (article) => !loadedArticleIds.has(article.id)
          );

          if (uniqueNewArticles.length > 0) {
            setArticles((prev) => [...prev, ...uniqueNewArticles]);

            // Update the set of loaded article IDs
            setLoadedArticleIds((prev) => {
              const updated = new Set(prev);
              uniqueNewArticles.forEach((article) => updated.add(article.id));
              return updated;
            });
          }
        }

        setHasMoreArticles(data.articles.length === pageSize);
      }
    } catch (error) {
      setError("Failed to load articles");
      console.error("Error fetching articles:", error);
    }
  };

  const loadData = async (refresh: boolean = false) => {
    setLoading(true);
    setError(null);

    await fetchSource();
    await fetchArticles(1, refresh);

    setLoading(false);
  };

  useEffect(() => {
    // Filter and sort articles whenever these dependencies change
    let result = [...articles];

    // Apply search filtering
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.group?.title.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.publicationDate).getTime();
      const dateB = new Date(b.publicationDate).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredArticles(result);
  }, [articles, searchText, sortOrder]);

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadData(true);
      setPage(1);
    } finally {
      event.detail.complete();
    }
  };

  const loadMore = () => {
    if (hasMoreArticles && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return "Unknown date";
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      if (diffMonths < 12) return `${diffMonths}mo ago`;
      return `${Math.floor(diffMonths / 12)}y ago`;
    } catch (e) {
      return "Recently";
    }
  };

  const handleScroll = (e: CustomEvent) => {
    const { scrollTop, scrollHeight, clientHeight } = e.detail.scrollElement;

    // Load more when user scrolls to bottom (with a small threshold)
    if (
      scrollHeight - scrollTop - clientHeight < 300 &&
      hasMoreArticles &&
      !loading
    ) {
      loadMore();
    }
  };

  // Generate a placeholder image based on text
  const getPlaceholderImage = (text: string): string => {
    return `https://source.unsplash.com/random/400x300?${text.replace(
      /\s+/g,
      ","
    )}`;
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  // Extract article groups to display as tags
  const extractGroups = (): { id: string; title: string }[] => {
    const groupsMap = new Map<string, { id: string; title: string }>();

    articles.forEach((article) => {
      if (article.group) {
        groupsMap.set(article.group.id, article.group);
      }
    });

    return Array.from(groupsMap.values());
  };

  const articleGroups = extractGroups();

  return (
    <IonPage className="source-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/search"
              icon={arrowBackOutline}
              text=""
            />
          </IonButtons>
          <IonTitle>
            {loading ? (
              <IonSkeletonText animated style={{ width: "70%" }} />
            ) : (
              source?.name || "Source"
            )}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={toggleSortOrder}
              title={`Sort by ${
                sortOrder === "newest" ? "oldest first" : "newest first"
              }`}
            >
              <IonIcon icon={filterOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        scrollEvents={true}
        onIonScroll={handleScroll}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="source-details">
              {loading ? (
                <>
                  <IonSkeletonText
                    animated
                    style={{ width: "60%", height: "32px" }}
                  />
                  <IonSkeletonText
                    animated
                    style={{ width: "40%", height: "20px" }}
                  />
                  <IonSkeletonText
                    animated
                    style={{ width: "30%", height: "20px" }}
                  />
                </>
              ) : (
                <>
                  <h1 className="source-name">{source?.name}</h1>

                  {source?.domain && (
                    <div className="source-url-container">
                      <a>{source.domain}</a>
                    </div>
                  )}

                  <div className="source-meta">
                    <IonChip outline className="source-meta-chip">
                      <IonIcon icon={calendarOutline} />
                      <IonLabel>
                        Added {formatDate(source?.createdAt || "")}
                      </IonLabel>
                    </IonChip>

                    <div className="source-article-count">
                      <span className="count">{source?.articleCount}</span>{" "}
                      articles
                    </div>
                  </div>

                  {articleGroups.length > 0 && (
                    <div className="article-groups-container">
                      <div className="group-chips-scroll">
                        {articleGroups.map((group) => (
                          <IonChip
                            key={group.id}
                            color="tertiary"
                            outline
                            className="group-chip"
                          >
                            <IonIcon icon={layersOutline} />
                            <IonLabel>{group.title}</IonLabel>
                          </IonChip>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="article-filter-container">
              <IonSearchbar
                placeholder="Filter articles..."
                value={searchText}
                onIonChange={(e) => setSearchText(e.detail.value || "")}
                showCancelButton="focus"
                animated
              />

              <IonSegment
                value={viewMode}
                onIonChange={(e) =>
                  setViewMode(e.detail.value as "cards" | "list")
                }
              >
                <IonSegmentButton value="cards">
                  <IonIcon icon={albumsOutline} />
                </IonSegmentButton>
                <IonSegmentButton value="list">
                  <IonIcon icon={reorderFourOutline} />
                </IonSegmentButton>
              </IonSegment>
            </div>

            <div className="source-articles-section">
              <div className="section-header">
                <h2 className="section-title">Latest Articles</h2>
                <IonNote className="sort-info">
                  {sortOrder === "newest" ? "Newest first" : "Oldest first"}
                </IonNote>
              </div>

              {viewMode === "cards" ? (
                <div className="article-cards">
                  {loading && filteredArticles.length === 0
                    ? // Skeleton loader for initial load
                      Array(3)
                        .fill(null)
                        .map((_, index) => (
                          <IonCard
                            key={`skeleton-${index}`}
                            className="article-card-skeleton"
                          >
                            <div className="card-img-skeleton">
                              <IonSkeletonText animated />
                            </div>
                            <IonCardHeader>
                              <IonSkeletonText
                                animated
                                style={{ width: "40%" }}
                              />
                              <IonSkeletonText
                                animated
                                style={{ width: "90%" }}
                              />
                            </IonCardHeader>
                            <IonCardContent>
                              <IonSkeletonText
                                animated
                                style={{ width: "60%" }}
                              />
                            </IonCardContent>
                          </IonCard>
                        ))
                    : filteredArticles.map((article) => (
                        <IonCard
                          key={article.id}
                          className="article-card"
                          routerLink={`/article/${article.id}`}
                        >
                          <div className="card-img-container">
                            <img
                              src={getPlaceholderImage(article.title)}
                              alt={article.title}
                              className="article-card-img"
                            />
                          </div>
                          <IonCardHeader>
                            {article.group && (
                              <IonCardSubtitle className="article-group-name">
                                <IonIcon icon={layersOutline} />
                                {article.group.title}
                              </IonCardSubtitle>
                            )}
                            <IonCardTitle className="article-card-title">
                              {article.title}
                            </IonCardTitle>
                          </IonCardHeader>
                          <IonCardContent className="article-card-meta">
                            <div className="article-date-info">
                              <IonIcon icon={timeOutline} />
                              <span className="article-date-text">
                                {formatRelativeTime(article.publicationDate)}
                              </span>
                            </div>
                          </IonCardContent>
                        </IonCard>
                      ))}
                </div>
              ) : (
                <IonList className="article-list">
                  {loading && filteredArticles.length === 0
                    ? // Skeleton loader for initial load
                      Array(5)
                        .fill(null)
                        .map((_, index) => (
                          <IonItem
                            key={`skeleton-${index}`}
                            className="article-item-skeleton"
                          >
                            <IonLabel>
                              <h2>
                                <IonSkeletonText
                                  animated
                                  style={{ width: "90%" }}
                                />
                              </h2>
                              <p>
                                <IonSkeletonText
                                  animated
                                  style={{ width: "40%" }}
                                />
                              </p>
                              <p>
                                <IonSkeletonText
                                  animated
                                  style={{ width: "30%" }}
                                />
                              </p>
                            </IonLabel>
                          </IonItem>
                        ))
                    : filteredArticles.map((article) => (
                        <IonItem
                          key={article.id}
                          className="article-list-item"
                          routerLink={`/article/${article.id}`}
                          detail={true}
                        >
                          <IonLabel>
                            <h2 className="article-list-title">
                              {article.title}
                            </h2>
                            {article.group && (
                              <div className="article-group-tag">
                                <IonIcon icon={layersOutline} />
                                {article.group.title}
                              </div>
                            )}
                            <p className="article-date-line">
                              <IonIcon icon={calendarOutline} />
                              {formatDate(article.publicationDate)}
                              <span className="relative-time">
                                ({formatRelativeTime(article.publicationDate)})
                              </span>
                            </p>
                          </IonLabel>
                          <IonIcon icon={chevronForward} slot="end" />
                        </IonItem>
                      ))}
                </IonList>
              )}

              {/* Loading indicator at the bottom when loading more */}
              {loading && filteredArticles.length > 0 && (
                <div className="loading-more">
                  <IonSkeletonText
                    animated
                    style={{ width: "100%", height: "60px" }}
                  />
                </div>
              )}

              {/* No articles message */}
              {!loading && filteredArticles.length === 0 && (
                <div className="no-articles">
                  {searchText ? (
                    <p>No articles match your search criteria.</p>
                  ) : (
                    <p>No articles found for this source.</p>
                  )}
                </div>
              )}

              {/* End of list message */}
              {!loading && !hasMoreArticles && filteredArticles.length > 0 && (
                <div className="end-of-list">
                  <p>You've reached the end of the list</p>
                </div>
              )}
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SourcePage;
