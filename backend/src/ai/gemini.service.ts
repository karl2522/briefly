import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sanitizeAiContent, sanitizeTopic } from '../common/utils/sanitize.util';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private modelName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set in environment variables');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Try different model names - some may not be available in all regions
      // Start with gemini-pro as it's the most commonly available
      this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-pro';
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      this.logger.log(`Gemini AI service initialized with model: ${this.modelName}`);
    } catch (error) {
      this.logger.error('Failed to initialize Gemini AI service', error);
      throw new Error('Failed to initialize Gemini AI service');
    }
  }

  /**
   * Try to initialize with a fallback model if the current one fails
   */
  private async tryFallbackModel(fallbackModels: string[]): Promise<void> {
    for (const fallbackModel of fallbackModels) {
      try {
        this.logger.warn(`Trying fallback model: ${fallbackModel}`);
        this.model = this.genAI.getGenerativeModel({ model: fallbackModel });
        this.modelName = fallbackModel;
        this.logger.log(`Switched to model: ${fallbackModel} (will be tested on first use)`);
        return;
      } catch (error: any) {
        this.logger.warn(`Failed to initialize model ${fallbackModel}: ${error.message || error}`);
      }
    }
    throw new Error('All model attempts failed. Please check your API key and available models.');
  }

  /**
   * List available models from the API
   * Uses header-based authentication instead of query parameter to prevent API key exposure
   */
  private async listAvailableModels(): Promise<string[]> {
    try {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models',
        {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey || '',
          },
        },
      );
      
      if (!response.ok) {
        this.logger.warn(`Failed to list models: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      if (data.models && Array.isArray(data.models)) {
        return data.models
          .map((m: any) => m.name?.replace('models/', '') || m.name)
          .filter((name: string) => name && name.includes('gemini'));
      }
      return [];
    } catch (error) {
      this.logger.warn('Failed to list available models', error);
      return [];
    }
  }

  /**
   * Check if error is a model not found error and handle fallback
   */
  private isModelNotFoundError(error: any): boolean {
    return (
      error?.status === 404 ||
      error?.message?.includes('not found') ||
      error?.message?.includes('is not found for API version') ||
      error?.errorDetails?.includes('not found')
    );
  }

  /**
   * Execute a model call with automatic fallback on model errors
   */
  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackModels?: string[],
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (this.isModelNotFoundError(error)) {
        this.logger.warn(`Model ${this.modelName} not found, trying fallback models...`);
        
        // If no fallback models provided, try to list available models
        let modelsToTry = fallbackModels;
        if (!modelsToTry || modelsToTry.length === 0) {
          const availableModels = await this.listAvailableModels();
          if (availableModels.length > 0) {
            this.logger.log(`Found ${availableModels.length} available models: ${availableModels.join(', ')}`);
            modelsToTry = availableModels;
          } else {
            // Fallback to common model names - try gemini-pro first as it's most widely available
            modelsToTry = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];
          }
        }
        
        try {
          await this.tryFallbackModel(modelsToTry);
          // Retry the operation with the new model
          return await operation();
        } catch (fallbackError) {
          this.logger.error('Error with fallback models', fallbackError);
          throw new Error(
            `Model not available. Tried models: ${modelsToTry.join(', ')}. Please check your API key and available models.`,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Generate flashcards from text
   */
  async generateFlashcards(text: string, topic?: string): Promise<any[]> {
    // Sanitize inputs to prevent prompt injection
    const sanitizedText = sanitizeAiContent(text);
    const sanitizedTopic = topic ? sanitizeTopic(topic) : undefined;

    const prompt = `Generate flashcards from the following text${sanitizedTopic ? ` about ${sanitizedTopic}` : ''}. 
Return a JSON array with objects containing "question" and "answer" fields. 
Make the questions clear and the answers concise but informative.

Text:
${sanitizedText}

Return only valid JSON array, no markdown formatting or additional text.`;

    try {
      const textResponse = await this.executeWithFallback(async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Log response length for debugging
        this.logger.log(`[generateFlashcards] Raw response length: ${text?.length || 0} characters`);
        
        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini API');
        }
        
        return text;
      });

      // Log raw response (truncated for security)
      this.logger.log(`[generateFlashcards] Raw response preview: ${textResponse?.substring(0, 200) || 'empty'}...`);

      // Extract JSON BEFORE sanitization (sanitization might remove code blocks containing JSON)
      // Try to find JSON array in markdown code blocks first
      let jsonToParse = textResponse;
      
      // Check for JSON in markdown code blocks (```json ... ```)
      const codeBlockMatch = textResponse.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonToParse = codeBlockMatch[1];
        this.logger.log('[generateFlashcards] Found JSON in markdown code block');
      } else {
        // Try to extract JSON array directly
        const jsonArrayMatch = textResponse.match(/\[[\s\S]*\]/);
        if (jsonArrayMatch && jsonArrayMatch[0]) {
          jsonToParse = jsonArrayMatch[0];
          this.logger.log('[generateFlashcards] Found JSON array in response');
        }
      }
      
      // Sanitize only if we didn't extract JSON from code block
      // But be careful - don't sanitize the JSON itself, just the surrounding text
      const sanitizedResponse = codeBlockMatch ? jsonToParse : sanitizeAiContent(textResponse);
      
      // Log sanitized response length
      this.logger.log(`[generateFlashcards] Response to parse length: ${sanitizedResponse?.length || 0} characters`);
      
      if (!sanitizedResponse || sanitizedResponse.trim().length === 0) {
        this.logger.error('[generateFlashcards] Response is empty');
        throw new Error('AI response was empty');
      }

      // Try to extract JSON from the response (if not already extracted)
      const jsonMatch = sanitizedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch && jsonMatch[0] && jsonMatch[0].trim().length > 0) {
        try {
          const jsonString = jsonMatch[0].trim();
          // Validate JSON string is not empty
          if (jsonString.length < 2) { // Minimum is "[]"
            throw new Error('JSON string too short');
          }
          
          const parsed = JSON.parse(jsonString);
          // Validate that parsed data is an array
          if (Array.isArray(parsed)) {
            this.logger.log(`[generateFlashcards] Successfully parsed ${parsed.length} flashcards`);
            return parsed;
          } else {
            this.logger.warn('[generateFlashcards] Parsed JSON is not an array');
          }
        } catch (parseError) {
          this.logger.warn(`[generateFlashcards] Failed to parse JSON match: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          this.logger.warn(`[generateFlashcards] JSON match preview: ${jsonMatch[0].substring(0, 500)}...`);
          this.logger.warn(`[generateFlashcards] JSON match length: ${jsonMatch[0].length}`);
        }
      } else {
        this.logger.warn('[generateFlashcards] No JSON array pattern found in response');
        this.logger.warn(`[generateFlashcards] Response preview: ${sanitizedResponse.substring(0, 500)}...`);
      }

      // Fallback: try to parse the entire response
      if (sanitizedResponse.trim().length > 0) {
        try {
          const parsed = JSON.parse(sanitizedResponse.trim());
          if (Array.isArray(parsed)) {
            this.logger.log(`[generateFlashcards] Successfully parsed entire response as array: ${parsed.length} flashcards`);
            return parsed;
          } else {
            this.logger.warn('[generateFlashcards] Parsed response is not an array');
          }
        } catch (parseError) {
          this.logger.error(`[generateFlashcards] Failed to parse entire response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          this.logger.error(`[generateFlashcards] Response preview: ${sanitizedResponse.substring(0, 500)}...`);
          this.logger.error(`[generateFlashcards] Response length: ${sanitizedResponse.length}`);
        }
      } else {
        this.logger.error('[generateFlashcards] Response is empty, cannot parse');
      }

      throw new Error('Invalid response format from AI - response does not contain valid JSON array');
    } catch (error) {
      this.logger.error('Error generating flashcards', error);
      
      // Provide more specific error messages
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        this.logger.error('JSON parsing error - AI response may be incomplete or malformed');
        throw new Error('AI response was incomplete or invalid. Please try again with shorter content.');
      }
      
      if (error instanceof Error && error.message.includes('Empty')) {
        throw new Error('AI service returned empty response. Please check your API key and try again.');
      }
      
      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Summarize text
   */
  async summarizeText(text: string, length: 'short' | 'medium' | 'long' = 'medium'): Promise<string> {
    // Sanitize input to prevent prompt injection
    const sanitizedText = sanitizeAiContent(text);

    const lengthInstructions = {
      short: 'in 2-3 sentences',
      medium: 'in a concise paragraph',
      long: 'in multiple paragraphs with key points',
    };

    const prompt = `Summarize the following text ${lengthInstructions[length]}:

${sanitizedText}

Provide a clear and concise summary:`;

    try {
      const summary = await this.executeWithFallback(async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });

      // Sanitize AI response before returning
      return sanitizeAiContent(summary);
    } catch (error) {
      this.logger.error('Error summarizing text', error);
      throw new Error('Failed to summarize text');
    }
  }

  /**
   * Generate study guide
   */
  async generateStudyGuide(content: string, subject?: string): Promise<string> {
    // Sanitize inputs to prevent prompt injection
    const sanitizedContent = sanitizeAiContent(content);
    const sanitizedSubject = subject ? sanitizeTopic(subject) : undefined;

    const prompt = `Create a comprehensive study guide${sanitizedSubject ? ` for ${sanitizedSubject}` : ''} from the following content. 
Organize it into clear sections with headings, key concepts, important points, and examples.

Content:
${sanitizedContent}

Format the study guide with clear sections and bullet points:`;

    try {
      const studyGuide = await this.executeWithFallback(async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });

      // Sanitize AI response before returning
      return sanitizeAiContent(studyGuide);
    } catch (error) {
      this.logger.error('Error generating study guide', error);
      throw new Error('Failed to generate study guide');
    }
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz(
    content: string,
    numberOfQuestions: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  ): Promise<any[]> {
    // Sanitize input to prevent prompt injection
    const sanitizedContent = sanitizeAiContent(content);
    // Ensure numberOfQuestions is within valid range
    const validNumberOfQuestions = Math.min(Math.max(1, numberOfQuestions), 50);

    const prompt = `Generate ${validNumberOfQuestions} ${difficulty} quiz questions from the following content.
Return a JSON array with objects containing "question", "options" (array of 4 strings), and "correctAnswer" (index of correct option) fields.

Content:
${sanitizedContent}

Return only valid JSON array, no markdown formatting or additional text.`;

    try {
      const textResponse = await this.executeWithFallback(async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Log response length for debugging
        this.logger.log(`[generateQuiz] Raw response length: ${text?.length || 0} characters`);
        
        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini API');
        }
        
        return text;
      });

      // Log raw response (truncated for security)
      this.logger.log(`[generateQuiz] Raw response preview: ${textResponse?.substring(0, 200) || 'empty'}...`);

      // Extract JSON BEFORE sanitization (sanitization might remove code blocks containing JSON)
      // Try to find JSON array in markdown code blocks first
      let jsonToParse = textResponse;
      
      // Check for JSON in markdown code blocks (```json ... ```)
      const codeBlockMatch = textResponse.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonToParse = codeBlockMatch[1];
        this.logger.log('[generateQuiz] Found JSON in markdown code block');
      } else {
        // Try to extract JSON array directly
        const jsonArrayMatch = textResponse.match(/\[[\s\S]*\]/);
        if (jsonArrayMatch && jsonArrayMatch[0]) {
          jsonToParse = jsonArrayMatch[0];
          this.logger.log('[generateQuiz] Found JSON array in response');
        }
      }
      
      // Sanitize only if we didn't extract JSON from code block
      // But be careful - don't sanitize the JSON itself, just the surrounding text
      const sanitizedResponse = codeBlockMatch ? jsonToParse : sanitizeAiContent(textResponse);
      
      // Log sanitized response length
      this.logger.log(`[generateQuiz] Response to parse length: ${sanitizedResponse?.length || 0} characters`);
      
      if (!sanitizedResponse || sanitizedResponse.trim().length === 0) {
        this.logger.error('[generateQuiz] Response is empty');
        throw new Error('AI response was empty');
      }

      // Try to extract JSON from the response (if not already extracted)
      const jsonMatch = sanitizedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch && jsonMatch[0] && jsonMatch[0].trim().length > 0) {
        try {
          const jsonString = jsonMatch[0].trim();
          // Validate JSON string is not empty
          if (jsonString.length < 2) { // Minimum is "[]"
            throw new Error('JSON string too short');
          }
          
          const parsed = JSON.parse(jsonString);
          // Validate that parsed data is an array
          if (Array.isArray(parsed)) {
            this.logger.log(`[generateQuiz] Successfully parsed ${parsed.length} quiz questions`);
            return parsed;
          } else {
            this.logger.warn('[generateQuiz] Parsed JSON is not an array');
          }
        } catch (parseError) {
          this.logger.warn(`[generateQuiz] Failed to parse JSON match: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          this.logger.warn(`[generateQuiz] JSON match preview: ${jsonMatch[0].substring(0, 500)}...`);
          this.logger.warn(`[generateQuiz] JSON match length: ${jsonMatch[0].length}`);
        }
      } else {
        this.logger.warn('[generateQuiz] No JSON array pattern found in response');
        this.logger.warn(`[generateQuiz] Response preview: ${sanitizedResponse.substring(0, 500)}...`);
      }

      // Fallback: try to parse the entire response
      if (sanitizedResponse.trim().length > 0) {
        try {
          const parsed = JSON.parse(sanitizedResponse.trim());
          if (Array.isArray(parsed)) {
            this.logger.log(`[generateQuiz] Successfully parsed entire response as array: ${parsed.length} questions`);
            return parsed;
          } else {
            this.logger.warn('[generateQuiz] Parsed response is not an array');
          }
        } catch (parseError) {
          this.logger.error(`[generateQuiz] Failed to parse entire response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          this.logger.error(`[generateQuiz] Response preview: ${sanitizedResponse.substring(0, 500)}...`);
          this.logger.error(`[generateQuiz] Response length: ${sanitizedResponse.length}`);
        }
      } else {
        this.logger.error('[generateQuiz] Response is empty, cannot parse');
      }

      throw new Error('Invalid response format from AI - response does not contain valid JSON array');
    } catch (error) {
      this.logger.error('Error generating quiz', error);
      
      // Provide more specific error messages
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        this.logger.error('JSON parsing error - AI response may be incomplete or malformed');
        throw new Error('AI response was incomplete or invalid. Please try again with shorter content.');
      }
      
      if (error instanceof Error && error.message.includes('Empty')) {
        throw new Error('AI service returned empty response. Please check your API key and try again.');
      }
      
      throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}



