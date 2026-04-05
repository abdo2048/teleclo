/**
 * Sanitizes HTML content to prevent XSS attacks
 * This is a basic implementation - in production, consider using a library like DOMPurify
 * @param {string} htmlContent
 * @returns {string} Sanitized HTML content
 */
export function sanitizeHtml(htmlContent) {
  if (typeof htmlContent !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove iframe tags with javascript/data sources
  sanitized = sanitized.replace(/<iframe\b[^>]*src\s*=\s*['"]\s*(javascript:|data:)[^'"]*['"][^>]*>[\s\S]*?<\/iframe>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '');
  
  // Remove javascript: and data: URIs (except safe data:image)
  sanitized = sanitized.replace(
    /(href|src|action)\s*=\s*(['"])\s*(javascript:|data:(?!image\/[^'"]*;))[^'"]*\2/gi, 
    ''
  );

  // Remove potentially dangerous protocols
  sanitized = sanitized.replace(
    /(href|src|action)\s*=\s*(['"])\s*(vbscript:|file:|ftp:)[^'"]*\2/gi, 
    ''
  );

  // Remove expressions and behaviors (IE)
  sanitized = sanitized.replace(/-moz-binding\s*:[^;]*;/gi, '');
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');

  return sanitized;
}

/**
 * Sanitizes plain text content
 * @param {string} textContent
 * @returns {string} Sanitized text content
 */
export function sanitizeText(textContent) {
  if (typeof textContent !== 'string') {
    return '';
  }
  
  // Remove null bytes and other control characters that aren't whitespace
  return textContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitizes a post title
 * @param {string} title
 * @returns {string} Sanitized title
 */
export function sanitizeTitle(title) {
  if (typeof title !== 'string') {
    return '';
  }
  
  // Remove HTML tags from title
  const withoutTags = title.replace(/<[^>]*>/g, '');
  
  // Remove potentially harmful characters
  return withoutTags.replace(/[<>]/g, '');
}