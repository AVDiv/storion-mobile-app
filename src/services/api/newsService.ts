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
}

export const newsService = new NewsService();
