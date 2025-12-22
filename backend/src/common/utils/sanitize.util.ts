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

