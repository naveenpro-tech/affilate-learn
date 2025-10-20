/**
 * Frontend Input Sanitization
 * Protects against XSS and validates user input
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeHTML(text: string): string {
  if (!text) return text;
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Strip all HTML tags from text
 */
export function stripHTML(html: string): string {
  if (!html) return html;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Sanitize user input for display
 */
export function sanitizeUserInput(
  text: string,
  options: {
    maxLength?: number;
    allowNewlines?: boolean;
    trim?: boolean;
  } = {}
): string {
  if (!text) return text;
  
  let sanitized = text;
  
  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }
  
  // Remove newlines if not allowed
  if (!options.allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');
  }
  
  // Limit length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  // Escape HTML
  sanitized = sanitizeHTML(sanitized);
  
  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return filename;
  
  // Remove path separators and special characters
  let sanitized = filename.replace(/[/\\:*?"<>|]/g, '');
  
  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const parts = sanitized.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    const name = parts.join('.');
    sanitized = name.substring(0, maxLength - ext.length - 1) + (ext ? '.' + ext : '');
  }
  
  return sanitized;
}

/**
 * Sanitize tags
 */
export function sanitizeTags(tags: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  
  const sanitized = tags
    .map(tag => {
      // Trim and lowercase
      let clean = tag.trim().toLowerCase();
      
      // Remove special characters except hyphens and underscores
      clean = clean.replace(/[^a-z0-9_-]/g, '');
      
      // Limit length
      if (clean.length > 50) {
        clean = clean.substring(0, 50);
      }
      
      return clean;
    })
    .filter(tag => tag.length > 0);  // Remove empty tags
  
  // Remove duplicates
  const unique = Array.from(new Set(sanitized));
  
  // Limit number of tags
  return unique.slice(0, 10);
}

/**
 * Sanitize prompt input for AI generation
 */
export function sanitizePrompt(prompt: string): string {
  if (!prompt) return prompt;
  
  let sanitized = prompt.trim();
  
  // Remove potentially harmful instructions
  const dangerousPatterns = [
    /ignore (previous|all) instructions?/gi,
    /disregard (previous|all) instructions?/gi,
    /forget (previous|all) instructions?/gi,
    /system:?\s*/gi,
    /admin:?\s*/gi,
    /root:?\s*/gi,
  ];
  
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Limit length
  const maxLength = 2000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
}

/**
 * Validate and sanitize form data
 */
export function validateFormData(
  data: Record<string, any>,
  rules: Record<string, {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // Check required
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = 'This field is required';
      continue;
    }
    
    // Skip validation if field is empty and not required
    if (!value) continue;
    
    // Check min length
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors[field] = `Minimum length is ${rule.minLength} characters`;
      continue;
    }
    
    // Check max length
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors[field] = `Maximum length is ${rule.maxLength} characters`;
      continue;
    }
    
    // Check pattern
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors[field] = 'Invalid format';
      continue;
    }
    
    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors[field] = 'Invalid value';
      continue;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Debounce function for input validation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

