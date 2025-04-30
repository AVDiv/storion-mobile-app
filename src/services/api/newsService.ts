import { apiService } from "./apiService";
import { NewsEvent, NewsEventArticlesResponse } from "../../types";

/**
 * Service for interacting with the News Events API
 */
class NewsService {
  /**
   * Get a specific news event by ID
   * @param id The ID of the news event to retrieve
   * @returns Promise resolving to the news event data
   */
  public async getNewsEventById(id: string): Promise<NewsEvent> {
    return apiService.get<NewsEvent>(`/news-events/${id}`);
  }

  /**
   * Get articles related to a specific news event
   * @param id The ID of the news event
   * @param limit Maximum number of articles to return (default: 10, max: 100)
   * @param offset Number of articles to skip for pagination (default: 0)
   * @returns Promise resolving to the articles response
   */
  public async getNewsEventArticles(
    id: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<NewsEventArticlesResponse> {
    return apiService.get<NewsEventArticlesResponse>(
      `/news-events/${id}/articles?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get trending news events
   * @param limit Maximum number of events to return
   * @param offset Number of events to skip for pagination
   * @returns Promise resolving to an array of news events
   */
  public async getTrendingNewsEvents(
    limit: number = 10,
    offset: number = 0
  ): Promise<NewsEvent[]> {
    // Assuming there's an endpoint for trending news events
    return apiService.get<NewsEvent[]>(
      `/news-events/trending?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get latest news events
   * @param limit Maximum number of events to return
   * @param offset Number of events to skip for pagination
   * @returns Promise resolving to an array of news events
   */
  public async getLatestNewsEvents(
    limit: number = 10,
    offset: number = 0
  ): Promise<NewsEvent[]> {
    // Assuming there's an endpoint for latest news events
    return apiService.get<NewsEvent[]>(
      `/news-events/latest?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get news events by category
   * @param category The category to filter by
   * @param limit Maximum number of events to return
   * @param offset Number of events to skip for pagination
   * @returns Promise resolving to an array of news events
   */
  public async getNewsByCategory(
    category: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<NewsEvent[]> {
    // Assuming there's an endpoint for filtering by category
    return apiService.get<NewsEvent[]>(
      `/news-events/category/${category}?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get personalized feed content based on the specified parameters
   * @param queryString - Query parameters from the Feed API
   * @returns Array of news events
   */
  async getFeedContent(queryString: string): Promise<NewsEvent[]> {
    try {
      const response = await apiService.get(`/feed?${queryString}`);

      if (!response || !response.articleGroups) {
        return [];
      }

      // Transform the articleGroups data into the NewsEvent format
      return response.articleGroups.map((group: any) => ({
        id: group.id,
        title: group.title,
        summary: group.description || "",
        topics: group.topics || [],
        imageUrl: group.imageUrl || this.getRandomPlaceholderImage(group.title),
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      }));
    } catch (error) {
      console.error("Failed to fetch feed content:", error);
      throw error;
    }
  }

  /**
   * Get a random placeholder image for an article based on its title
   * @param title The article title to use for generating image
   * @returns URL to a placeholder image
   */
  private getRandomPlaceholderImage(title: string): string {
    // Use the title to generate a consistent but seemingly random image for the same content
    const titleHash = this.simpleHash(title);
    const imageId = titleHash % 1000; // Limit to 1000 possible images
    return `https://source.unsplash.com/random/800x600?news,${imageId}`;
  }

  /**
   * Create a simple hash from a string
   * @param str The string to hash
   * @returns A numeric hash value
   */
  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash);
  }
}

export const newsService = new NewsService();
