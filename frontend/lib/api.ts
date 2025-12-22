const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
      const response = await fetch(`${this.baseURL}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.data?.csrfToken) {
        this.csrfToken = data.data.csrfToken;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();

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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
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
  async generateFlashcards(text: string, topic?: string): Promise<ApiResponse<{ flashcards: any[]; count: number }>> {
    return this.request<{ flashcards: any[]; count: number }>('/ai/flashcards', {
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

  async generateQuiz(content: string, numberOfQuestions?: number, difficulty?: 'easy' | 'medium' | 'hard'): Promise<ApiResponse<{ quiz: any[]; count: number }>> {
    return this.request<{ quiz: any[]; count: number }>('/ai/quiz', {
      method: 'POST',
      body: JSON.stringify({ content, numberOfQuestions, difficulty }),
    });
  }
}

export const apiClient = new ApiClient();


