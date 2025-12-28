const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://briefly-backend-production-277d.up.railway.app/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  // Tokens are now in httpOnly cookies, not in response
  // This interface is kept for backward compatibility
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  canEditProfile?: boolean;
  provider?: 'google' | 'facebook' | 'email';
}

class ApiClient {
  private baseURL: string;
  private csrfToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Fetch CSRF token on initialization
    if (typeof window !== 'undefined') {
      this.fetchCsrfToken();
    }
  }

  /**
   * Fetches CSRF token from backend
   */
  private async fetchCsrfToken(): Promise<void> {
    try {
      console.log(`[API] Fetching CSRF token from ${this.baseURL}/csrf-token`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseURL}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`[API] CSRF token fetch failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      if (data.success && data.data?.csrfToken) {
        this.csrfToken = data.data.csrfToken;
        console.log('[API] CSRF token fetched successfully');
      } else {
        console.warn('[API] CSRF token response missing token:', data);
      }
    } catch (error) {
      console.error('[API] Failed to fetch CSRF token:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[API] CSRF token fetch timed out');
      }
    }
  }

  /**
   * Gets CSRF token, fetching if not available
   */
  private async getCsrfToken(): Promise<string | null> {
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }
    return this.csrfToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get CSRF token for state-changing requests
    const method = options.method || 'GET';
    const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const csrfToken = needsCsrf ? await this.getCsrfToken() : null;
    
    // Tokens are in httpOnly cookies, so browser sends them automatically
    // No need to manually add Authorization header
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers,
    };
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Important: sends cookies with request
      headers,
    };

    console.log(`[API] ${method} ${url}`, { needsCsrf, hasCsrfToken: !!csrfToken });

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log(`[API] Response status: ${response.status} for ${url}`);
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error(`[API] Non-JSON response for ${url}:`, text);
        return {
          success: false,
          error: `Invalid response format: ${text.substring(0, 100)}`,
        };
      }

      if (!response.ok) {
        // If 401 Unauthorized, try to refresh token (max 1 retry)
        if (response.status === 401 && retryCount === 0) {
          const refreshResponse = await this.refreshToken();
          if (refreshResponse.success) {
            // Retry original request with new tokens (in cookies)
            return this.request<T>(endpoint, options, retryCount + 1);
          } else {
            // Refresh failed, clear any stale tokens and redirect to sign-in
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/sign-in';
            }
            return {
              success: false,
              error: 'Session expired. Please sign in again.',
            };
          }
        }

        // Backend returns ApiResponse format for errors
        const errorData = data as ApiResponse<null>;
        // Extract error message - handle both string and array formats
        let errorMessage = errorData.error || errorData.message || 'An error occurred';
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join(' ');
        }
        return {
          success: false,
          error: errorMessage,
          message: Array.isArray(errorData.message) ? errorData.message.join(' ') : errorData.message,
        };
      }

      // Backend wraps successful responses in ApiResponse format via TransformInterceptor
      const responseData = data as ApiResponse<T>;
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        if (responseData.success && responseData.data) {
          return {
            success: true,
            data: responseData.data,
          };
        }
        // If success is false but we got 200, still return error
        return {
          success: false,
          error: responseData.error || responseData.message || 'An error occurred',
          message: responseData.message,
        };
      }

      // Fallback for direct data (if not wrapped by interceptor)
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error(`[API] Request failed for ${url}:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout. Please check your connection and try again.',
          };
        }
        return {
          success: false,
          error: error.message || 'Network error occurred',
        };
      }
      
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Auth methods
  async register(email: string, password: string, name?: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    // Refresh token is read from httpOnly cookie by backend
    // No need to pass it in body
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Ensure cookies are sent
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request<null>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me', {
      method: 'GET',
    });
  }

  async updateProfile(data: { name?: string; avatar?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Token management
  // Tokens are now stored in httpOnly cookies by the backend
  // These methods are kept for backward compatibility but are no longer used
  setTokens(accessToken: string, refreshToken: string) {
    // Tokens are set in httpOnly cookies by backend
    // No action needed - cookies are managed server-side
    // This method is kept for backward compatibility
  }

  getToken(): string | null {
    // Tokens are in httpOnly cookies, cannot be read by JavaScript
    // This method is kept for backward compatibility but returns null
    return null;
  }

  getRefreshToken(): string | null {
    // Tokens are in httpOnly cookies, cannot be read by JavaScript
    // This method is kept for backward compatibility but returns null
    return null;
  }

  clearTokens() {
    // Tokens are cleared by backend when logout is called
    // This method is kept for backward compatibility
    // Backend clears cookies on logout endpoint
  }

  // AI endpoints
  async generateFlashcards(text: string, topic?: string): Promise<ApiResponse<{ flashcards: any[]; count: number; flashcardSetId?: string }>> {
    return this.request<{ flashcards: any[]; count: number; flashcardSetId?: string }>('/ai/flashcards', {
      method: 'POST',
      body: JSON.stringify({ text, topic }),
    });
  }

  async summarizeText(text: string, length?: 'short' | 'medium' | 'long'): Promise<ApiResponse<{ summary: string; originalLength: number; summaryLength: number }>> {
    return this.request<{ summary: string; originalLength: number; summaryLength: number }>('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ text, length }),
    });
  }

  async generateStudyGuide(content: string, subject?: string): Promise<ApiResponse<{ studyGuide: string }>> {
    return this.request<{ studyGuide: string }>('/ai/study-guide', {
      method: 'POST',
      body: JSON.stringify({ content, subject }),
    });
  }

  async generateQuiz(content: string, numberOfQuestions?: number, difficulty?: 'easy' | 'medium' | 'hard'): Promise<ApiResponse<{ quiz: any[]; count: number; quizSetId?: string }>> {
    return this.request<{ quiz: any[]; count: number; quizSetId?: string }>('/ai/quiz', {
      method: 'POST',
      body: JSON.stringify({ content, numberOfQuestions, difficulty }),
    });
  }

  // Flashcard Sets endpoints
  async getFlashcardSets(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/flashcard-sets', {
      method: 'GET',
    });
  }

  async getFlashcardSet(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcard-sets/${id}`, {
      method: 'GET',
    });
  }

  async createFlashcardSet(data: { topic: string; flashcards: Array<{ question: string; answer: string }> }): Promise<ApiResponse<any>> {
    return this.request<any>('/flashcard-sets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFlashcardSet(id: string, data: { topic?: string; flashcards?: Array<{ question: string; answer: string }> }): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcard-sets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFlashcardSet(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/flashcard-sets/${id}`, {
      method: 'DELETE',
    });
  }

  // Quiz Sets endpoints
  async getQuizSets(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/quiz-sets', {
      method: 'GET',
    });
  }

  async getQuizSet(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/quiz-sets/${id}`, {
      method: 'GET',
    });
  }

  async createQuizSet(data: { topic: string; numberOfQuestions: number; difficulty: 'easy' | 'medium' | 'hard'; questions: Array<{ question: string; options: string[]; correctAnswer: number }> }): Promise<ApiResponse<any>> {
    return this.request<any>('/quiz-sets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuizSet(id: string, data: { topic?: string; numberOfQuestions?: number; difficulty?: 'easy' | 'medium' | 'hard'; questions?: Array<{ question: string; options: string[]; correctAnswer: number }> }): Promise<ApiResponse<any>> {
    return this.request<any>(`/quiz-sets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteQuizSet(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/quiz-sets/${id}`, {
      method: 'DELETE',
    });
  }

  // Study Guides endpoints
  async getStudyGuides(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/study-guides', {
      method: 'GET',
    });
  }

  async getStudyGuide(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/study-guides/${id}`, {
      method: 'GET',
    });
  }

  async createStudyGuide(data: { content: string; subject?: string; studyGuide: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/study-guides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudyGuide(id: string, data: { content?: string; subject?: string; studyGuide?: string }): Promise<ApiResponse<any>> {
    return this.request<any>(`/study-guides/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStudyGuide(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/study-guides/${id}`, {
      method: 'DELETE',
    });
  }

  // Summaries endpoints
  async getSummaries(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/summaries', {
      method: 'GET',
    });
  }

  async getSummary(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/summaries/${id}`, {
      method: 'GET',
    });
  }

  async createSummary(data: { text: string; summary: string; length: 'short' | 'medium' | 'long'; originalLength: number; summaryLength: number }): Promise<ApiResponse<any>> {
    return this.request<any>('/summaries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSummary(id: string, data: { text?: string; summary?: string; length?: 'short' | 'medium' | 'long'; originalLength?: number; summaryLength?: number }): Promise<ApiResponse<any>> {
    return this.request<any>(`/summaries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSummary(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/summaries/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();







