/**
 * Sanitizes user input to prevent XSS attacks
 * Removes HTML tags and script content
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitizes email input (basic sanitization, validation happens in DTO)
 */
export function sanitizeEmail(email: string): string {
  return sanitizeInput(email).toLowerCase();
}

/**
 * Sanitizes name input
 */
export function sanitizeName(name: string | null | undefined): string {
  return sanitizeInput(name || '');
}

/**
 * Sanitizes AI content input to prevent prompt injection attacks
 * Removes common prompt injection patterns while preserving legitimate content
 */
export function sanitizeAiContent(content: string | null | undefined): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let sanitized = content;

  // Remove common prompt injection patterns
  // Remove instructions to ignore previous prompts
  sanitized = sanitized.replace(/ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|commands?)/gi, '');
  sanitized = sanitized.replace(/forget\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|commands?)/gi, '');
  sanitized = sanitized.replace(/disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|commands?)/gi, '');

  // Remove attempts to override system instructions
  sanitized = sanitized.replace(/system\s*:\s*/gi, '');
  sanitized = sanitized.replace(/assistant\s*:\s*/gi, '');
  sanitized = sanitized.replace(/user\s*:\s*/gi, '');

  // Remove attempts to execute code
  sanitized = sanitized.replace(/```[\s\S]*?```/g, ''); // Remove code blocks that might contain malicious code
  sanitized = sanitized.replace(/`[^`]*`/g, ''); // Remove inline code

  // Remove common injection delimiters
  sanitized = sanitized.replace(/---+/g, '');
  sanitized = sanitized.replace(/===+/g, '');

  // Remove excessive newlines that might be used for injection
  sanitized = sanitized.replace(/\n{10,}/g, '\n\n');

  // Apply basic XSS sanitization
  sanitized = sanitizeInput(sanitized);

  // Trim and return
  return sanitized.trim();
}

/**
 * Sanitizes topic/subject input for AI prompts
 */
export function sanitizeTopic(topic: string | null | undefined): string {
  if (!topic || typeof topic !== 'string') {
    return '';
  }

  // Remove HTML and script tags
  let sanitized = sanitizeInput(topic);

  // Remove special characters that could be used for injection
  sanitized = sanitized.replace(/[<>{}[\]\\|`]/g, '');

  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized.trim();
}

